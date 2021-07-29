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
}

export const texasHoldEmService = new TexasHoldEmService();