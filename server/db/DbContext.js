import mongoose from "mongoose";
import ProfileSchema from "../models/Profile";
class DbContext {
  Profile = mongoose.model("Profile", ProfileSchema);

}

export const dbContext = new DbContext();
