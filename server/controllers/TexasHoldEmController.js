import BaseController from "../utils/BaseController";
import auth0provider from "@bcwdev/auth0provider";
import { texasHoldEmService } from "../services/TexasHoldEmService"

export class TexasHoldEmController extends BaseController {
  constructor() {
    super("api/texasholdem");
    this.router
      .post("/createtable", this.createTable)
      .use(auth0provider.getAuthorizedUserInfo)
      .get("/gettables", this.getAllTables)
  }
  async createTable(req, res, next) {
    try {
      let newTable = await texasHoldEmService.createTable(req.body)
      res.send(newTable)
    } catch (error) {
      next(error)
    }
  }
  async getAllTables(req, res, next) {
    try {
      let tables = await texasHoldEmService.getAllTables()
      res.send(tables)
    } catch (error) {
      next(error)
    }
  }
}
