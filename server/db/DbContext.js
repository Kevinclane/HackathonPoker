import mongoose from "mongoose";
import ProfileSchema from "../models/Profile";
import TexasHoldEmSchema from "../models/TexasHoldEm"
import BetSchema from "../models/Bet"
class DbContext {
  Profile = mongoose.model("Profile", ProfileSchema);
  TexasHoldEm = mongoose.model("TexasHoldEm", TexasHoldEmSchema)
  Bet = mongoose.model("Bet", BetSchema)
}

export const dbContext = new DbContext();
