import { dbContext } from "../db/DbContext";
import { BadRequest } from "../utils/Errors";
import { cardsService } from "./CardsService"

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
      newTable.Seats[i].TableId = newTable.id
      newTable.Seats[i] = await dbContext.Seat.findByIdAndUpdate(newTable.Seats[i].id,
        { TableId: newTable.id },
        { new: true })
      i++
    }
    newTable = await dbContext.TexasHoldEm.findByIdAndUpdate(newTable.id, newTable, { new: true }).populate("Seats")
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
    let table = await dbContext.TexasHoldEm.findById(tableId)
    let i = 0
    while (i < table.Seats.length) {
      if (table.Seats[i].Player) {
        let data = await cardsService.drawFromDeck(table.Deck, 2)
        table.Deck = data.Deck

      }
      i++
    }
    table = await dbContext.findByIdAndUpdate(table.id, table, { new: true })
  }
  async joinTable(tableId, user) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    if (!profile) {
      throw new BadRequest("Cannot add null userId")
    }
    let table = await dbContext.TexasHoldEm.findByIdAndUpdate(
      { _id: tableId },
      { $addToSet: { PlayersWatching: profile.id } }
    ).populate({
      path: "Seats",
      populate: {
        path: "Player",
        populate: {
          path: "Player"
        }
      }
    }).populate("TotalBets").populate("TurnBets")
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
    }).populate("TotalBets").populate("TurnBets")
    //TODO handle money stuff here after leaving 
    let i = table.Seats.findIndex(s => s.Player.Player.id == profile.id)
    if (i != -1) {
      await dbContext.Seat.findByIdAndUpdate(table.Seats[i].id,
        { Player: null }
      )
    }
    if (table.PlayersWatching.includes(profile.id)) {
      await dbContext.TexasHoldEm.findByIdAndUpdate(tableId,
        { $pull: { PlayersWatching: profile.id } })
    }
    if (table.PlayersAtTable.includes(profile.id)) {
      await dbContext.TexasHoldEm.findByIdAndUpdate(tableId,
        { $pull: { PlayersAtTable: profile.id } })
    }
    return true
  }
  async sit(tableId, user, data) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    if (!profile) {
      throw new BadRequest("Cannot add null userId")
    }
    let playerTableData = await dbContext.PlayerTableData.create({
      TableId: tableId,
      Player: profile.id,
      Wallet: data.buyIn
    })

    let seat = await dbContext.Seat.findOne({
      TableId: tableId,
      Position: data.position
    }).populate("Player")
    if (seat.Player == null) {
      seat = await dbContext.Seat.findByIdAndUpdate(seat.id,
        { Player: playerTableData.id },
        { new: true }).populate({
          path: "Player",
          populate: {
            path: "Player",
            populate: {
              path: "Cards"
            }
          }
        })
    }
    await dbContext.TexasHoldEm.findByIdAndUpdate(
      { _id: tableId },
      { $pull: { PlayersWatching: profile.id } }
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
        path: "Player",
        populate: {
          path: "Cards"
        }
      }
    })

    let i = 0
    while (i < seats.length) {
      if (seats[i].Player) {
        if (seats[i].Player.Player._id != profile._id) {
          seats[i].Player.Cards = []
        }
      }
      i++
    }
    return seats
  }
}

export const texasHoldEmService = new TexasHoldEmService();