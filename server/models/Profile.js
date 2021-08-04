import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Profile = new Schema(
  {
    subs: [{ type: String, unique: true }],
    email: { type: String, lowercase: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    credits: { type: Number, default: 10000 },
    cardBack: { type: String, default: "red_back.png" }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default Profile;
