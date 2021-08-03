import { isValidObjectId } from "mongoose";
import { dbContext } from "../db/DbContext";
import { BadRequest } from "../utils/Errors";
import moment from "moment"

var Hand = require('pokersolver').Hand;

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
        await this.bundleBets(table)
        newStage = "Round2"
        break;
      case "Round2":
        await this.bundleBets(table)
        newStage = "Round3"
        break;
      case "Round3":
        await this.bundleBets(table)
        newStage = "End"
        break;
      case "End":
        table = await this.resetGame(table)
        break;
    }
    if (newStage != "") {
      await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
        { LifeStage: newStage })
    }
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

  async bundleBets(table) {
    try {
      let players = []
      let total = 0
      let i = 0
      while (i < table.Seats.length) {
        if (table.Seats[i].Player) {
          players.push(table.Seats[i].Player)
        }
        total += table.Seats[i].Bet.Escrow
        await dbContext.Bet.findByIdAndUpdate(table.Seats[i].Bet._id,
          { Escrow: 0 })
        i++
      }

      let bundledBet = await dbContext.BundledBet.create({
        TableId: table._id,
        Escrow: total,
        Players: players
      })

      await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
        { $addToSet: { Bets: bundledBet._id } },
        { new: true })

    } catch (error) {
      console.error(error)
    }
  }

  async resetGame(table) {
    try {

      table = await table.populate({
        path: "Seats",
        populate: {
          path: "Player"
        }
      }).populate("Winner").populate("Bets").execPopulate()

      let totalWinnings = 0

      i = 0
      while (i < table.Bets.length) {
        totalWinnings += table.Bets[i].Escrow
        await dbContext.BundledBet.findByIdAndDelete(table.Bets[i]._id)
        i++
      }

      let i = 0
      while (i < table.Seats.length) {

        await dbContext.Bet.findByIdAndUpdate(table.Seats[i].Bet,
          { Escrow: 0 })

        await dbContext.PlayerTableData.findByIdAndUpdate(table.Seats[i].Player._id,
          { Cards: [] })
        //update playertabledata.cards

        //if this fails, _id is not good to use on an object that was populated(>> <<)
        await dbContext.Seat.findByIdAndUpdate(table.Seats[i]._id,
          { Status: "Idle" })

        if (table.Seats[i].Player == table.Winner) {
          let total = totalWinnings + table.Seat[i].Player.Wallet
          await dbContext.PlayerTableData.findByIdAndUpdate(table.Winner,
            { Wallet: total })
        }

        i++
      }

      table = await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
        {
          Bets: [],
          CommunityCards: [],
          Deck: [],
          PlayersTurn: null,
          Winner: []
        })

      return table
    } catch (error) {
      console.error(error)
    }
  }

  async calculateWinner(table) {
    table = await table.populate({
      path: "Seats",
      populate: {
        path: "Player",
        populate: {
          path: "Cards"
        }
      }
    }).populate("Winner").populate("Bets").execPopulate()

    let bestHands = []
    let i = 0
    while (i < table.Seats.length) {

      if (table.Seats[i].Player) {

        let cards = table.CommunityCards.concat(table.Seats[i].Player.Cards)

        cards = this.convertCardFormat(cards)

        let bestHand = Hand.solve(cards)

        bestHands.push({ hand: bestHand, player: table.Seats[i].Player._id })
      }
      i++
    }

    i = 0
    let justHands = []
    while (i < bestHands.length) {
      justHands.push(bestHands[i].hand)
      i++
    }
    let winner = Hand.winners(justHands)

    let winArr = []
    i = 0
    while (i < winner.length) {
      let index = bestHands.findIndex(h => h.hand.cards == winner[i].cards)
      if (index != -1) {
        winArr.push(bestHands[index].player)
      }
      i++
    }

    let expTime = moment().add(30, "seconds")

    table = await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
      {
        Timer: expTime,
        Winner: winArr
      },
      { new: true }).populate({
        path: "Seats",
        populate: {
          path: "Player"
        }
      })
    return table
  }

  convertCardFormat(cards) {
    let i = 0
    let formedCards = []
    while (i < cards.length) {
      let split = cards[i].Name.split("")
      if (split[0] == "10") {
        split[0] = "T"
      }
      let fc = split[0] + split[1].toLowerCase()
      formedCards.push(fc)
      i++
    }
    return formedCards
  }

}

export const gameTickerService = new GameTickerService();