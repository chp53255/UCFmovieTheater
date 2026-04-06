import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    showDate: {
      type: String,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 10,
    },
    availableSeats: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

const Showtime = mongoose.model("Showtime", showtimeSchema);

export default Showtime;
