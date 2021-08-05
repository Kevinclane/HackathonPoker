import { dbContext } from "../db/DbContext";
import { texasHoldEmService } from "./TexasHoldEmService";
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
        await this.setNoTurn(table)
        newStage = "End"
        break;
      case "End":
        await this.resetGame(table)
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
    await dbContext.Seat.findOneAndUpdate(
      {
        _id: table.PlayersInGame[0]._id,
        TableId: table.id
      },
      { Status: "Turn" },
      { new: true })
  }

  async bundleBets(table) {
    try {
      // let players = []
      let total = 0
      let i = 0
      while (i < table.Seats.length) {
        // if (table.Seats[i].Player) {
        // players.push(table.Seats[i].Player)
        // }
        total += table.Seats[i].Bet.Escrow
        await dbContext.Bet.findByIdAndUpdate(table.Seats[i].Bet._id,
          { Escrow: 0 })
        i++
      }

      let bundledBet = await dbContext.BundledBet.create({
        TableId: table._id,
        Escrow: total,
        // Players: players
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

      let i = 0
      while (i < table.Bets.length) {
        totalWinnings += table.Bets[i].Escrow
        await dbContext.BundledBet.findByIdAndDelete(table.Bets[i]._id)
        i++
      }

      //shared winnings
      totalWinnings = totalWinnings / table.Winner.length

      let winnerPTDs = await dbContext.PlayerTableData.find({
        TableId: table._id,
        Winner: true
      })

      i = 0
      while (i < winnerPTDs.length) {
        let total = totalWinnings + winnerPTDs[i].Wallet

        await dbContext.PlayerTableData.findByIdAndUpdate(winnerPTDs[i]._id,
          { Wallet: total })
        i++
      }

      table = await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
        {
          Bets: [],
          CommunityCards: [],
          Deck: [],
          PlayersTurn: null,
          Winner: [],
          LifeStage: "Start"
        })

      await dbContext.BundledBet.deleteMany({ TableId: table._id })

      await dbContext.PlayerTableData.updateMany({ TableId: table._id },
        {
          Cards: [],
          Winner: false
        })

      await dbContext.Seat.updateMany({ TableId: table._id },
        { Status: "Idle" })


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

      if (table.Seats[i].Player && table.Seats[i].Status != "Folded") {

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
        await dbContext.PlayerTableData.findByIdAndUpdate(bestHands[index].player,
          { Winner: true })
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
          path: "Player",
          populate: {
            path: "Cards"
          }
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

  async setNoTurn(table) {
    try {
      await dbContext.Seat.updateMany({ TableId: table._id },
        { Status: "Idle" })
      await dbContext.TexasHoldEm.findByIdAndUpdate(table._id,
        { PlayersTurn: null })
    } catch (error) {
      console.log(error)
    }
  }

  async hardReset(id) {
    await dbContext.Bet.deleteMany({ TableId: id })
    await dbContext.Seat.deleteMany({ TableId: id })
    await dbContext.PlayerTableData.deleteMany({ TableId: id })
    await dbContext.TexasHoldEm.findByIdAndDelete(id)
    await dbContext.BundledBet.deleteMany({ TableId: id })
    await texasHoldEmService.createTable({
      BuyIn: 100,
      Number: 1
    })
  }

  async defaultWin(table) {
    try {
      table = await table.populate({
        path: "Seats",
        populate: {
          path: "Player",
          populate: {
            path: "Player"
          }
        }
      }).execPopulate()

      await this.bundleBets(table)

      let PTD = await dbContext.PlayerTableData.findById(table.PlayersInGame[0])

      let newWallet = PTD.Wallet

      let i = 0
      while (i < table.Bets.length) {
        newWallet += table.Bets[i].Escrow
        await dbContext.BundledBet.findByIdAndDelete(table.Bets[i]._id)
        i++
      }

      await dbContext.PlayerTableData.findByIdAndUpdate(table.PlayersInGame[0],
        { Wallet: newWallet })

    } catch (error) {
      console.error(error)
    }
  }

}

export const gameTickerService = new GameTickerService();