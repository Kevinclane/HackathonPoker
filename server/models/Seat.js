import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const Seat = new Schema(
  {
    TableId: { type: ObjectId, ref: "TexasHoldEm" },
    Player: { type: ObjectId, ref: "PlayerTableData" },
    Position: { type: Number },
    Status: { type: String, default: "Idle", enum: ["Idle", "Turn", "Folded"] },
    CurrentBets: [{ type: ObjectId, ref: "Bet" }]
  }
)

export default Seat