import mongoose from "mongoose";
const Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

const Hand = new Schema(
  {
    Player: { type: ObjectId, ref: "Profile" },
    Cards: { type: Object }
  }
)

export default Hand