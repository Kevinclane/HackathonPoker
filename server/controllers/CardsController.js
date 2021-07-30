import BaseController from "../utils/BaseController";
import auth0provider from "@bcwdev/auth0provider";
import { cardsService } from "../services/CardsService"

export class CardsController extends BaseController {
  constructor() {
    super("api/cards");
    this.router
      .use(auth0provider.getAuthorizedUserInfo)
      .get("/gethand/:id", this.getHand)
  }
  async getHand(req, res, next) {
    try {
      let playerTableData = await cardsService.getPlayerTableData(req.params.id, req.userInfo)
      res.send(playerTableData)
    } catch (error) {
      next(error)
    }
  }
}
