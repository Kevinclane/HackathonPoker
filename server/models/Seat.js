import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const Seat = new Schema(
  {
    TableId: { type: ObjectId, ref: "TexasHoldEm" },
    Player: { type: ObjectId, ref: "PlayerTableData" },
    Position: { type: Number }
  }
)

export default Seat