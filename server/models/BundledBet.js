import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const BundledBet = new Schema(
  {
    TableId: { type: ObjectId, ref: "TexasHoldEm" },
    Escrow: { type: Number, default: 0 },
    Players: [{ type: ObjectId, ref: "PlayerTableData" }]
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default BundledBet;
