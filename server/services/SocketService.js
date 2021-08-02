import SocketIO from "socket.io";
import auth0provider from "@bcwdev/auth0provider";
import { texasHoldEmService } from "./TexasHoldEmService";
import { gameTickerService } from "./GameTickerService";
import { cardsService } from "./CardsService";
import { dbContext } from "../db/DbContext";
import moment from "moment"


let state = {}
class SocketService {
  io = SocketIO();
  /**
   * @param {SocketIO.Server} io
   */
  setIO(io) {
    try {
      this.io = io;
      //Server listeners
      io.on("connection", this._onConnect());
      this._gameTicker()
    } catch (e) {
      console.error("[SOCKETSTORE ERROR]", e);
    }
  }

  /**
   * @param {SocketIO.Socket} socket
   */
  async Authenticate(socket, bearerToken) {
    try {
      let user = await auth0provider.getUserInfoFromBearerToken(bearerToken);
      socket["user"] = user;
      socket.join(user.id);
      socket.emit("AUTHENTICATED");
      this.io.emit("UserConnected", user.id);
    } catch (e) {
      socket.emit("error", e);
    }
  }

  /**
   * @param {SocketIO.Socket} socket
   * @param {string} room
   */
  JoinRoom(socket, room) {
    // this._gameTicker(room)
    state.recentActivity.push({
      action: "GetGame",
      payload: room
    })
    socket.join(room);
  }
  /**
   * @param {SocketIO.Socket} socket
   * @param {string} room
   */
  LeaveRoom(socket, room) {
    socket.leave(room);
  }
  /**
   * Sends a direct message to a user
   * @param {string} userId
   * @param {string} eventName
   * @param {any} payload
   */
  messageUser(userId, eventName, payload) {
    try {
      this.io.to(userId).emit(eventName, payload);
    } catch (e) { }
  }

  messageRoom(room, eventName, payload) {
    this.io.to(room).emit(eventName, payload);
  }

  _onConnect() {
    return socket => {
      this._newConnection(socket);

      //STUB Register listeners
      socket.on("dispatch", this._onDispatch(socket));
      socket.on("disconnect", this._onDisconnect(socket));
      socket.on("texasholdem", this._texasHoldEmRouter(socket));
    };
  }

  _onDisconnect(socket) {
    return () => {
      try {
        if (!socket.user) {
          return;
        }
        this.io.emit("UserDisconnected", socket.user.id);
      } catch (e) { }
    };
  }

  _onDispatch(socket) {
    return (payload = {}) => {
      try {
        var action = this[payload.action];
        if (!action || typeof action != "function") {
          return socket.emit("error", "Unknown Action");
        }
        action.call(this, socket, payload.data);
      } catch (e) { }
    };
  }

  _newConnection(socket) {
    //Handshake / Confirmation of Connection
    socket.emit("CONNECTED", {
      socket: socket.id,
      message: "Successfully Connected"
    });
  }

  //#region GAME TICKER FUNCTIONS

  _texasHoldEmRouter() {
    return (req) => {
      try {
        switch (req.action) {
          case "getSeats":
            this.io.emit("GetSeats", req.body.tableId)
            break
          case "userChoice":
            this._userChoice(req.body)
            break
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  _userChoice(choice) {
    state.recentActivity.push({
      action: "GetGame",
      payload: choice.tableId
    })

    let i = state.playersTurnCounter.findIndex(p => p.table._id == choice.tableId)

    if (choice.type == "Raise") {
      state.playersTurnCounter[i].players = [choice.playerId]
    } else {
      state.playersTurnCounter[i].players.push(choice.playerId)
    }

    if (state.playersTurnCounter[i].table.PlayersAtTable.length == state.playersTurnCounter[i].players.length) {
      gameTickerService.handleRoundChange(state.playersTurnCounter[i].table)
      state.playersTurnCounter[i].players = []
    }
  }

  async _gameTicker() {
    await this._setupState()
    setInterval(() => {
      if (state.recentActivity.length > 0) {
        this._activityHandler()
        state.recentActivity = []
      }
      this._healthChecker()
      console.log("Game ticker")
    }, 5000)
    // this._healthChecker()

  }

  async _setupState() {
    let builtState = {
      recentActivity: [],
      playersTurnCounter: [],
    }

    let tables = await dbContext.TexasHoldEm.find()
    let i = 0
    while (i < tables.length) {
      builtState.playersTurnCounter.push({
        table: tables[i],
        players: []
      })
      i++
    }

    state = builtState
  }

  async _activityHandler() {
    let ra = [...state.recentActivity]
    let i = 0
    while (i < ra.length) {
      switch (ra[i].action) {
        case "GetGame":
          this.io.emit("GetGame", ra[i].payload)
          break;
      }
      i++
    }
  }

  //queries db for all tables and check the count of players at table 
  //returns an array of objects with 2 keys: table, boolean alive
  async _healthChecker() {
    let healthCheck = await gameTickerService.statusCheck()

    let i = 0
    while (i < healthCheck.length) {
      if (healthCheck[i].alive) {
        healthCheck[i] = await this._stageChecker(healthCheck[i])
      }
      i++
    }
    i = 0
    while (i < healthCheck.length) {
      let x = 0
      while (x < healthCheck[i].tasks.length) {
        await this._executeTasks(healthCheck[i].tasks[x])
        x++
      }
      i++
    }
  }

  async _stageChecker(hc) {
    try {
      let updateDom = false
      switch (hc.table.LifeStage) {
        case "Start":
          hc.table = await gameTickerService.getPlayersInGame(hc.table)

          await cardsService.dealHands(hc.table);
          // let timer = moment().add(30, "seconds")

          hc.table = await dbContext.TexasHoldEm.findByIdAndUpdate(hc.table.id,
            {
              LifeStage: "Round1",
              PlayersTurn: hc.table.PlayersInGame[0]._id,
            },
            { new: true })
          await gameTickerService.setNextPlayer(hc.table)
          updateDom = true
          break;

        case "Round1":
          //should only trigger on the first cycle of round1 to draw comm cards
          if (hc.table.CommunityCards.length == 0) {
            let dc = await cardsService.drawFromDeck(hc.table.Deck, 3)
            hc.table = await dbContext.TexasHoldEm.findByIdAndUpdate(hc.table._id,
              {
                Deck: dc.Deck,
                CommunityCards: dc.cards
              },
              { new: true })
            updateDom = true
          }
          console.log("Round1")
          break;
        case "Round2":
          if (hc.table.CommunityCards.length == 3) {
            let dc = await cardsService.drawFromDeck(hc.table.Deck, 1)

            let plusCard = [...hc.table.CommunityCards, dc.cards[0]]

            hc.table = await dbContext.TexasHoldEm.findByIdAndUpdate(hc.table._id,
              {
                Deck: dc.Deck,
                CommunityCards: plusCard
              },
              { new: true })
          }
          console.log("Round2")
          break;
        case "Round3":
          if (hc.table.CommunityCards.length == 4) {
            let dc = await cardsService.drawFromDeck(hc.table.Deck, 1)

            let plusCard = [...hc.table.CommunityCards, dc.cards[0]]

            hc.table = await dbContext.TexasHoldEm.findByIdAndUpdate(hc.table._id,
              {
                Deck: dc.Deck,
                CommunityCards: plusCard
              },
              { new: true })
          }
          console.log("Round3")
          break;
        case "End":
          //
          console.log("End")
          break;
      }
      if (updateDom) {
        this.io.emit("GetGame", hc.table._id)
      }
      return hc
    } catch (error) {
      console.error(error)
    }
  }

  async executeTasks(task) {
    switch (task.action) {
      case "GetGame":
        this.io.emit("GetGame", task.payload)
    }
  }

  async __playerLeft(data, socket) {
    try {
      this.io.emit("PlayerLeft", data.playerId)
    } catch (error) {
      console.error(error)
    }
  }

}

const socketService = new SocketService();

export default socketService;
