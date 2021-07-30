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
      .get("/getseats/:id", this.getSeats)
      .put("/jointable/:id", this.joinTable)
      .put("leavetable/:id", this.leaveTable)
      .put("/sit/:id", this.sit)
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

  async getSeats(req, res, next) {
    try {
      let seats = await texasHoldEmService.getSeats(req.params.id, req.userInfo)
      res.send(seats)
    } catch (error) {
      next(error)
    }
  }
  async joinTable(req, res, next) {
    try {
      let table = await texasHoldEmService.joinTable(req.params.id, req.userInfo)
      res.send(table)
    } catch (error) {
      next(error)
    }
  }
  async leaveTable(req, res, next) {
    try {
      let data = await texasHoldEmService.leaveTable(req.params.id, req.userInfo)
      res.send(data)
    } catch (error) {
      next(error)
    }
  }
  async sit(req, res, next) {
    try {
      let seat = await texasHoldEmService.sit(req.params.id, req.userInfo, req.body)
      res.send(seat)
    } catch (error) {
      next(error)
    }
  }
}
