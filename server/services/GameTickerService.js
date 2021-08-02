import { isValidObjectId } from "mongoose";
import { dbContext } from "../db/DbContext";
import { BadRequest } from "../utils/Errors";
class GameTickerService {
  async statusCheck() {
    let tables = await dbContext.TexasHoldEm.find().populate({
      path: "Seats",
      populate: {
        path: "Player",
        populate: {
          path: "Player"
        }
      }
    }).populate("Bets")

    let healthCheck = []

    let i = 0
    while (i < tables.length) {
      let tableHealth = {
        table: tables[i],
        tasks: []
      }

      if (tables[i].PlayersAtTable.length < 2) {
        //maybe update db model to !active if needed
        tableHealth.alive = false
      } else {
        //also maybe update db
        tableHealth.alive = true
      }
      healthCheck.push(tableHealth)
      i++
    }
    return healthCheck
  }

  async handleRoundChange(table) {
    let newStage = ""
    switch (table.LifeStage) {
      case "Round1":
        newStage = "Round2"
        break;
      case "Round2":
        newStage = "Round3"
        break;
      case "Round3":
        newStage = "End"
        break
    }
    await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
      { LifeStage: newStage })
  }

  async getPlayersInGame(table) {
    let players = []
    let i = 0
    while (i < table.Seats.length) {
      if (table.Seats[i].Player) {
        players.push(table.Seats[i])
      }
      i++
    }
    table = await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
      { PlayersInGame: players },
      { new: true }).populate({
        path: "Seats",
        populate: {
          path: "Player",
          populate: {
            path: "Player"
          }
        }
      }).populate("Bets").populate("PlayersInGame")
    return table
  }

  async setNextPlayer(table) {
    let test = await dbContext.Seat.findOneAndUpdate(
      {
        _id: table.PlayersInGame[0]._id,
        TableId: table.id
      },
      { Status: "Turn" },
      { new: true })
    console.log(test)
  }
}

export const gameTickerService = new GameTickerService();