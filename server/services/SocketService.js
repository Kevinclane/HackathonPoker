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
  async LeaveRoom(socket, idObj) {
    await texasHoldEmService.leaveTable(idObj.tableId, idObj.userId)
    this.io.emit("GetGame", idObj.tableId)
    socket.leave(idObj.tableId);
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
            break;
          case "userChoice":
            this._userChoice(req.body)
            break;
          case "hardReset":
            this._hardReset(req.body.tableId)
            break;
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  async _gameTicker() {
    await this._setupState()
    setInterval(() => {
      if (state.recentActivity.length > 0) {
        this._activityHandler()
      }
      this._healthChecker()
      console.log("Game ticker")
    }, 1000)
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
    state.recentActivity = []
  }

  //queries db for all tables and check the count of players at table 
  //returns an array of objects with 2 keys: table, boolean alive
  async _healthChecker() {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  async _stageChecker(hc) {
    try {
      let updateDom = false
      switch (hc.table.LifeStage) {
        case "Start":

          if (hc.table.Active) {
            hc.table.Deck = await cardsService.createDeck()
            await dbContext.TexasHoldEm.findByIdAndUpdate(hc.table._id,
              { Deck: hc.table.Deck })
          }

          hc.table = await gameTickerService.getPlayersInGame(hc.table)

          hc.table = await cardsService.dealHands(hc.table);

          hc.table = await dbContext.TexasHoldEm.findByIdAndUpdate(hc.table.id,
            {
              LifeStage: "Round1",
              PlayersTurn: hc.table.PlayersInGame[0]._id,
              Deck: hc.table.Deck,
              Active: true
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
                CommunityCards: dc.cards,
              },
              { new: true })
            updateDom = true
          }
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
            updateDom = true
          }
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
            updateDom = true
          }
          break;


        case "End":
          if (hc.table.Winner.length == 0) {
            hc.table = await gameTickerService.calculateWinner(hc.table)

            hc.table = await hc.table.populate("Bets").execPopulate()

            let i = 0
            while (i < hc.table.Seats.length) {
              if (hc.table.Seats[i].Player) {
                hc.table.Seats[i].Player = await hc.table.Seats[i].Player.populate("Player").execPopulate()
              }
              i++
            }

            this.io.emit("SetGame", hc.table)

          } else if (moment().isAfter(moment(hc.table.Timer))) {
            await gameTickerService.handleRoundChange(hc.table)

            let table = await dbContext.TexasHoldEm.findById(hc.table._id).populate({
              path: "Seats",
              populate: {
                path: "Player",
                populate: {
                  path: "Cards"
                }
              }
            }).populate("Bets")

            let i = 0
            while (i < table.Seats.length) {
              if (table.Seats[i].Player) {
                table.Seats[i].Player = await table.Seats[i].Player.populate("Player").execPopulate()
              }
              i++
            }

            this.io.emit("SetGame", table)
          }
          break;
      }
      if (updateDom) {
        this.io.emit("GetGame", hc.table._id)
        hc.tasks.push({ action: "GetGame", payload: hc.table.id })
      }
      return hc
    } catch (error) {
      console.error(error)
    }
  }

  async _executeTasks(task) {
    switch (task.action) {
      case "GetGame":
        this.io.emit("GetGame", task.payload)
    }
  }
  async _userChoice(choice) {
    try {
      state.recentActivity.push({
        action: "GetGame",
        payload: choice.Bet.TableId
      })
      //i is the index within the state that holds data about this table
      let i = state.playersTurnCounter.findIndex(p => p.table._id == choice.Bet.TableId)

      let table = await dbContext.TexasHoldEm.findById(state.playersTurnCounter[i].table.id).populate({
        path: "Seats",
        populate: {
          path: "Bet"
        }
      })

      //.players is a list of player who have already taken a turn this round
      //if type is "Raise", reset the list so everyone can take a turn on the new bet
      //if everyone has bet this round, continue on to the next
      if (choice.type == "Raise") {
        state.playersTurnCounter[i].players = [choice.Bet.Seat]
      } else if (choice.type != "Fold") {
        state.playersTurnCounter[i].players.push(choice.Bet.Seat)
      }



      if (table.PlayersInGame.length == state.playersTurnCounter[i].players.length) {
        gameTickerService.handleRoundChange(table)

        state.playersTurnCounter[i].players = []
      } else if (table.PlayersInGame.length == 1) {
        gameTickerService.defaultWin(table)
      }

    } catch (error) {
      console.error(error)
    }
  }

  async _hardReset(id) {
    try {
      await gameTickerService.hardReset(id)
      await this._setupState()
      this.io.emit("resetting")
    } catch (error) {
      console.error(error)
    }
  }

}

const socketService = new SocketService();

export default socketService;
