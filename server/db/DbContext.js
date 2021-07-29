import mongoose from "mongoose";
import ProfileSchema from "../models/Profile";
import TexasHoldEmSchema from "../models/TexasHoldEm"
import BetSchema from "../models/Bet"
import SeatSchema from "../models/Seat"
import HandSchema from "../models/Hand"
class DbContext {
  Profile = mongoose.model("Profile", ProfileSchema);
  TexasHoldEm = mongoose.model("TexasHoldEm", TexasHoldEmSchema)
  Bet = mongoose.model("Bet", BetSchema)
  Seat = mongoose.model("Seat", SeatSchema)
  Hand = mongoose.model("Hand", HandSchema)
}

export const dbContext = new DbContext();
