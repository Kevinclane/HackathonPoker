import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const TexasHoldEm = new Schema(
  {
    Cards: [{ type: Object }],
    CommunityCards: [{ type: Object }],
    Players: [{ type: ObjectId, ref: "Profile" }],
    PlayersTurn: { type: ObjectId, ref: "Profile" },
    Timer: { type: Number },
    Pot: { type: Number },
    CurrentBet: { type: Number }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default TexasHoldEm;
