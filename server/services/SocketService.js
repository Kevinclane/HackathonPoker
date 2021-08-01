import SocketIO from "socket.io";
import auth0provider from "@bcwdev/auth0provider";
import { texasHoldEmService } from "./TexasHoldEmService";
import { gameTickerService } from "./GameTickerService";
import { dbContext } from "../db/DbContext";


let state = {

}
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
    this._gameTicker(room)
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


  _texasHoldEmRouter(socket) {
    return (req) => {
      try {
        switch (req.action) {
          case "getSeats":
            this._getSeats(req.body, socket)
            break
          case "playerLeft":
            this._playerLeft(req.body, socket)
            break
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  async _gameTicker() {
    setInterval(() => {
      this._healthChecker()
      console.log("Game ticker")
    }, 10000)
  }

  async _healthChecker() {
    let healthCheck = await gameTickerService.statusCheck()


    if (healthCheck.Status == "Dead") {
      // terminated = true
      // gameBotRunning = false
      setTimeout(() => {
        this.handeTask(healthCheck)
      }, 10000)
    } else {

      switch (healthCheck.Table.LifeStage) {
        case "Start":
          //
          break;
        case "Round1":
          // check table.playersturn to local var 
          //change to next taken seat if ==
          break;
        case "Round2":
          //
          break;
        case "Round3":
          //
          break;
        case "End":
          //
          break;
      }

      if (healthCheck.LifeStage == "Start") {

      } else if (healthCheck.LifeStage == "Round1") {

      }
      setTimeout(() => {
        this.handeTask(healthCheck)
      }, 10000)
    }
  }

  async _startGame(data, socket) {
    try {
      if (gameBot == null) {
        gameBot = "Active"
        gameTickerService.startUp
      }
      await texasHoldEmService.dealHands(data.tableId)
      this.io.emit("StartGame", data.tableId)
    } catch (error) {
      console.error(error)
    }
  }

  async _getSeats(data) {
    try {
      this.io.emit("GetSeats", data.tableId)
    } catch (error) {
      console.error(error)
    }
  }

  async __playerLeft(data, socket) {
    try {
      this.io.emit("PlayerLeft", data.playerId)
    } catch (error) {
      console.error(error)
    }
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
}

const socketService = new SocketService();

export default socketService;
