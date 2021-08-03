import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const Bet = new Schema(
  {
    TableId: { type: ObjectId, ref: "TexasHoldEm" },
    Seat: { type: ObjectId, ref: "Seat" },
    Player: { type: ObjectId, ref: "Profile" },
    Escrow: { type: Number, default: 0 }
  }
)

export default Bet