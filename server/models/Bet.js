import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const Bet = new Schema(
  {
    TableId: { type: ObjectId, ref: "TexasHoldEm" },
    Player: { type: ObjectId, ref: "Profile" },
    Escrow: { type: Number },
    GroupNumber: { type: Number }
  }
)

export default Bet