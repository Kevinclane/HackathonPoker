import BaseController from "../utils/BaseController";
import auth0provider from "@bcwdev/auth0provider";
import { profilesService } from "../services/ProfilesService";

export class ProfilesController extends BaseController {
  constructor() {
    super("api/profile");
    this.router
      .use(auth0provider.getAuthorizedUserInfo)
      .get("", this.getUserProfile)
      .put("/pic", this.editPic)
      .put("/:id", this.edit)
  }
  async getUserProfile(req, res, next) {
    try {
      let profile = await profilesService.getProfile(req.userInfo);
      res.send(profile);
    } catch (error) {
      next(error);
    }
  }
  async edit(req, res, next) {
    try {
      req.body.creatorId = req.user.sub;
      res.send(req.body);
    } catch (error) {
      next(error);
    }
  }
  async editPic(req, res, next) {
    try {
      let profile = await profilesService.updatePic(req.body.img, req.userInfo)
      res.send(profile)
    } catch (error) {
      next(error)
    }
  }
}
