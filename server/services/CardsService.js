let suits = ["C", "D", "H", "S"]
let strs = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]

class CardsService {
  createDeck() {
    let deck = []
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
          name: name,
          img: name + ".png",
          value: value
        }
        deck.push(card)
        x++
      }
      i++
    }
    return deck
  }
}

export const cardsService = new CardsService();