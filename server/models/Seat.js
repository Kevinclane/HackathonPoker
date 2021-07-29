import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const Seat = new Schema(
  {
    Player: { type: ObjectId, ref: "Profile" },
    Wallet: { type: Number },
    Position: { type: Number }
  }
)

export default Seat