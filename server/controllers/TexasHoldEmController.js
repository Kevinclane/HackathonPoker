import BaseController from "../utils/BaseController";
import auth0provider from "@bcwdev/auth0provider";

export class TexasHoldEmController extends BaseController {
  constructor() {
    super("api/texasholdem");
    this.router
      .get("/", this.test)
      .use(auth0provider.getAuthorizedUserInfo)
  }
  async test(req, res, next) {
    try {
      let user = req.userInfo
      res.send("test")
    } catch (error) {
      next(error)
    }
  }
}
