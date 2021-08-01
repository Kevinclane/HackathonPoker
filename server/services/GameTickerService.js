import { dbContext } from "../db/DbContext";
import { BadRequest } from "../utils/Errors";
import socketService from "./SocketService";
import SocketIO from "socket.io";
class GameTickerService {
  io = SocketIO();

  // async startup() {
  //   let allTables = await dbContext.TexasHoldEm.find().populate({
  //     path: "Seats",
  //     populate: {
  //       path: "Player",
  //       populate: {
  //         path: "Player"
  //       }
  //     }
  //   }).populate("TotalBets").populate("TurnBets")

  //   let i = 0
  //   while (i < allTables.length) {
  //     let x = 0
  //     while (x < allTables[i].Seats.length) {
  //       if (allTables[i].Seats[x].Player) {
  //         allTables[i].Seats[x].Player.Cards = allTables[i].Seats[x].Player.populate("Cards").execPopulate()
  //       }
  //       x++
  //     }
  //     await this.joinRoom(allTables[i]._id)
  //     i++
  //   }

  //   setInterval(this.executionList(allTables), 30000)
  // }

  async executionList(tables) {
    let i = 0
    while (i < tables.length) {
      let liveCheck = await this.statusCheck(tables[i])
      if (liveCheck) {

      }
      i++
    }
  }

  async statusCheck() {
    let tables = await dbContext.TexasHoldEm.find().populate({
      path: "Seats",
      populate: {
        path: "Player",
        populate: {
          path: "Player"
        }
      }
    }).populate("TotalBets").populate("TurnBets")

    let healthCheck = {
      Tables: tables
    }

    //keep rebuilding here. change function to check all games

    if (table.PlayersAtTable.length == 0) {
      healthCheck.Status = "Dead"
      return healthCheck
    } else if (table.PlayersAtTable.length == 1) {
      healthCheck.Status = "Idle"
    } else {
      if (table.LifeStage == "Start") {
        healthCheck.Status = "Alive"
        healthCheck.task = "Start"
        return healthCheck
      } else if (table.LifeStage == "Round1") {
        //check for player response
      }

    }


  }

}

export const gameTickerService = new GameTickerService();