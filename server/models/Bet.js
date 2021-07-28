import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const Bet = new Schema(
  {
    Players: [{ type: ObjectId, ref: "Profile" }],
    Escrow: { type: Number }
  }
)

export default Bet