import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const PlayerTableData = new Schema(
  {
    TableId: { type: ObjectId, ref: "TexasHoldEm" },
    Player: { type: ObjectId, ref: "Profile" },
    Cards: [{ type: ObjectId, ref: "Card" }],
    Wallet: { type: Number }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default PlayerTableData;
