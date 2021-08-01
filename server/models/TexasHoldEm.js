import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const TexasHoldEm = new Schema(
  {
    Deck: [{ type: Object }],
    CommunityCards: [{ type: Object }],
    Seats: [{ type: ObjectId, ref: "Seat" }],
    PlayersWatching: [{ type: ObjectId, ref: "Profile" }],
    PlayersAtTable: [{ type: ObjectId, ref: "Profile" }],
    PlayersTurn: { type: ObjectId, ref: "Seat" },
    Timer: { type: Date },
    Round: { type: Number },
    TotalBets: [{ type: ObjectId, ref: "Bet" }],
    TurnBets: [{ type: ObjectId, ref: "Bet" }],
    BuyIn: { type: Number, required: true },
    Number: { type: Number, required: true },
    Active: { type: Boolean, default: false },
    LifeStage: { type: String, default: "Start", enum: ['Start', "Round1", "Round2", "Round3", "End"] }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default TexasHoldEm;
