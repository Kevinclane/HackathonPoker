import { dbContext } from "../db/DbContext"

let suits = ["C", "D", "H", "S"]
let strs = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]

class CardsService {
  async createDeck() {
    let cards = await dbContext.Card.find()
    if (cards.length == 0) {
      let i = 0
      while (i < suits.length) {
        let x = 0
        while (x < strs.length) {
          let name = strs[x] + suits[i]
          let value = strs[x]
          if (typeof value == "string") {
            if (value == "J") {
              value = 11
            } else if (value == "Q") {
              value = 12
            } else if (value == "K") {
              value = 13
            } else if (value == "A") {
              value = 14
            }
          }
          let card = {
            Name: name,
            Img: name + ".png",
            Value: value
          }
          card = await dbContext.Card.create(card)
          cards.push(card)
          x++
        }
        i++
      }
    }
    return cards
  }

  drawFromDeck(Deck, num) {
    let cards = []
    while (num > 0) {
      let i = Math.floor(Math.random() * (Deck.length + 1))
      cards.push(Deck[i])
      Deck.splice(i, 1)
      num--
    }
    return {
      cards,
      Deck
    }
  }
  async getPlayerTableData(tableId, user) {
    let profile = await dbContext.Profile.findOne({ email: user.email })
    let data = await dbContext.PlayerTableData.findOne({
      TableId: tableId,
      Player: profile.id
    })
    return data
  }
}

export const cardsService = new CardsService();