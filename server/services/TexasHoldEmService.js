import { dbContext } from "../db/DbContext";
import { BadRequest } from "../utils/Errors";
import { cardsService } from "./CardsService";

class TexasHoldEmService {
  async createTable(table) {
    table.Deck = await cardsService.createDeck()
    table.Seats = []
    let i = 0
    while (i < 6) {
      let seat = await dbContext.Seat.create({
        Position: i + 1
      })
      table.Seats.push(seat)
      i++
    }
    let newTable = await dbContext.TexasHoldEm.create(table)
    i = 0
    while (i < newTable.Seats.length) {
      newTable.Seats[i].TableId = newTable._id
      newTable.Seats[i] = await dbContext.Seat.findByIdAndUpdate(newTable.Seats[i]._id,
        { TableId: newTable._id },
        { new: true })
      i++
    }
    newTable = await dbContext.TexasHoldEm.findByIdAndUpdate(newTable._id, newTable, { new: true }).populate("Seats")
    return newTable
  }
  async getAllTables() {
    let tables = await dbContext.TexasHoldEm.find()
    let i = 0
    while (i < tables.length) {
      tables[i].Deck = []
      i++
    }
    return tables
  }
  async dealHands(tableId) {
    let table = await dbContext.TexasHoldEm.findById(tableId).populate({
      path: "Seats",
      populate: {
        path: "Player",
        populate: {
          path: "Player"
        }
      }
    })
    let i = 0
    while (i < table.Seats.length) {
      if (table.Seats[i].Player) {
        let data = await cardsService.drawFromDeck(table.Deck, 2)
        table.Deck = data.Deck
        await dbContext.PlayerTableData.findByIdAndUpdate(table.Seats[i].Player._id,
          { Cards: data.cards })
      }
      i++
    }
    table = await dbContext.TexasHoldEm.findByIdAndUpdate(table._id, table)
  }

  async joinTable(tableId, user) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    if (!profile) {
      throw new BadRequest("Cannot add null userId")
    }
    let table = await dbContext.TexasHoldEm.findById(tableId).populate({
      path: "Seats",
      populate: {
        path: "Player",
        populate: {
          path: "Player"
        }
      }
    }).populate("Bets")

    if (!table.PlayersAtTable.includes(profile._id)) {
      table = await dbContext.TexasHoldEm.findByIdAndUpdate(
        { _id: tableId },
        { $addToSet: { PlayersWatching: profile._id } }
      ).populate({
        path: "Seats",
        populate: {
          path: "Player",
          populate: {
            path: "Player"
          }
        }
      }).populate("Bets")
    }

    if (table.LifeStage != "Start") {
      let i = 0
      while (i < table.Seats.length) {
        if (table.Seats[i].Player) {
          if (table.Seats[i].Player.Player.id == profile.id) {
            table.Seats[i].Player = await table.Seats[i].Player.populate("Cards").execPopulate()
          } else {
            table.Seats[i].Player.Cards = []
          }
        }
        i++
      }
    }


    table.Deck = []
    return table
  }

  async leaveTable(tableId, user) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    let table = await dbContext.TexasHoldEm.findById(tableId).populate({
      path: "Seats",
      populate: {
        path: "Player",
        populate: {
          path: "Player"
        }
      }
    }).populate("Bets")
    //TODO handle money stuff here after leaving 
    let i = table.Seats.findIndex(s => s.Player.Player._id == profile._id)
    if (i != -1) {
      await dbContext.Seat.findByIdAndUpdate(table.Seats[i]._id,
        { Player: null }
      )
    }
    if (table.PlayersWatching.includes(profile._id)) {
      await dbContext.TexasHoldEm.findByIdAndUpdate(tableId,
        { $pull: { PlayersWatching: profile._id } })
    }
    if (table.PlayersAtTable.includes(profile._id)) {
      await dbContext.TexasHoldEm.findByIdAndUpdate(tableId,
        { $pull: { PlayersAtTable: profile._id } })
    }
    return true
  }

  //might be able to cut out the populates here and just have all of the players call a get request for seats. 
  async sit(tableId, user, data) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    if (!profile) {
      throw new BadRequest("Cannot add null userId")
    }
    let playerTableData = await dbContext.PlayerTableData.create({
      TableId: tableId,
      Player: profile._id,
      Wallet: data.buyIn
    })

    let seat = await dbContext.Seat.findOne({
      TableId: tableId,
      Position: data.position
    }).populate("Player")
    if (seat.Player == null) {
      seat = await dbContext.Seat.findByIdAndUpdate(seat._id,
        { Player: playerTableData._id },
        { new: true }).populate({
          path: "Player",
          populate: {
            path: "Player"
          }
        })
    }
    await dbContext.TexasHoldEm.findByIdAndUpdate(
      { _id: tableId },
      {
        $pull: { PlayersWatching: profile._id },
        $addToSet: { PlayersAtTable: profile._id }
      },
      { new: true }
    )

    return seat
  }

  async stand() {

  }
  async getSeats(tableId, user) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    let seats = await dbContext.Seat.find({ TableId: tableId }).populate({
      path: "Player",
      populate: {
        path: "Player"
      }
    })

    let i = 0
    while (i < seats.length) {
      if (seats[i].Player) {
        if (seats[i].Player.Player == profile._id) {
          seats[i].Player = seats[i].Player.populate("Cards").execPopulate()
        } else {
          seats[i].Player.Cards = []
        }
      }
      i++
    }
    return seats
  }

  async userChoice(choice, user) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    let PTD = await dbContext.PlayerTableData.findOne({
      TableId: choice.tableId,
      Player: profile._id
    })

    if (choice.type == "Raise" || choice.type == "Call") {
      let bet = await dbContext.Bet.create({
        Escrow: choice.amount,
        TableId: choice.tableId,
        Player: profile._id,
        GroupNumber: choice.groupNumber
      })

      let PTD = await dbContext.PlayerTableData.findOne({
        TableId: choice.tableId,
        Player: profile._id
      })
      let newPTDWallet = PTD.Wallet - choice.amount
      await dbContext.PlayerTableData.findByIdAndUpdate(PTD._id, { Wallet: newPTDWallet })

      let seat = await dbContext.Seat.findOneAndUpdate({
        TableId: choice.tableId,
        Player: PTD._id
      },
        {
          $addToSet: { CurrentBets: bet.id },
          Status: "Idle"
        })

      await this.changePlayerTurn(seat)

    } else if (choice.type == "Pass") {

      let seat = await dbContext.Seat.findOneAndUpdate({
        TableId: choice.tableId,
        Player: PTD.id
      },
        { Status: "Idle" }
      )

      await this.changePlayerTurn(seat)

    } else if (choice.type == "Fold") {

      let seat = await dbContext.Seat.findOneAndUpdate({
        TableId: choice.tableId,
        Player: PTD.id,
        Status: "Folded"
      })

      await this.changePlayerTurn(seat)
    }
  }

  async changePlayerTurn(seat) {
    let nextSeatNumber = seat.Position + 1
    if (nextSeatNumber == 7) {
      nextSeatNumber = 1
    }

    let nextPlayersTurn = await dbContext.Seat.findOneAndUpdate({
      TableId: seat.TableId,
      Position: nextSeatNumber
    },
      { Status: "Turn" },
      { new: true })

    await dbContext.TexasHoldEm.findByIdAndUpdate(seat.TableId,
      { PlayersTurn: nextPlayersTurn })
  }

  async deleteTable(id) {
    let table = await dbContext.TexasHoldEm.findById(id).populate("Seats")

    await dbContext.PlayerTableData.deleteMany({ TableId: table.id })
    await dbContext.Seat.deleteMany({ TableId: table.id })
    await dbContext.Bet.deleteMany({ TableId: table.id })
    await dbContext.TexasHoldEm.findByIdAndDelete(id)

    return "Successfully deleted all items associated to: " + id
  }

}

export const texasHoldEmService = new TexasHoldEmService();