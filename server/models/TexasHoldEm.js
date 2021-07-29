import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const TexasHoldEm = new Schema(
  {
    Cards: [{ type: Object }],
    CommunityCards: [{ type: Object }],
    Seats: [{ type: ObjectId, ref: "Seat" }],
    Players: [{ type: ObjectId, ref: "Profile" }],
    PlayersInRound: [{ type: ObjectId, ref: "Profile" }],
    PlayersTurn: { type: ObjectId, ref: "Profile" },
    PlayersTableData: [{ type: ObjectId, ref: "PlayerTableData" }],
    Timer: { type: Date },
    TotalBets: [{ type: ObjectId, ref: "Bet" }],
    TurnBets: [{ type: ObjectId, ref: "Bet" }],
    BuyIn: { type: Number },
    Number: { type: Number },
    Active: { type: Boolean, default: false }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default TexasHoldEm;
