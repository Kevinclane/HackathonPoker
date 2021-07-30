import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TexasHoldEm = new Schema(
  {
    Img: { type: String, required: true },
    Name: { type: String, required: true },
    Value: { type: Number }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default TexasHoldEm;
