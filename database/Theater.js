import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Theater = mongoose.model("Theater", theaterSchema);

export default Theater;
