import { dbContext } from "../db/DbContext";
import { BadRequest } from "../utils/Errors";
import { cardsService } from "./CardsService"

class TexasHoldEmService {
  async createTable(table) {
    table.Cards = await cardsService.createDeck()
    let newLobby = await dbContext.TexasHoldEm.create(table)
    return newLobby
  }
  async getAllTables() {
    let tables = await dbContext.TexasHoldEm.find()
    return tables
  }
  async dealHands() {

  }
  async joinTable(tableId, user) {
    if (user.id == null) {
      throw new BadRequest("Cannot add null userId")
    }
    await dbContext.TexasHoldEm.findByIdAndUpdate(
      { _id: tableId },
      { $addToSet: { Players: user.id } }
    )
  }
}

export const texasHoldEmService = new TexasHoldEmService();