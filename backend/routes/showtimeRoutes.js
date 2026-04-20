import express from "express";
import Showtime from "../models/Showtime.js";
import Theater from "../models/Theater.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all showtimes — populate movie and theater details
router.get("/", verifyToken, async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate("movie", "title description duration posterURL")
      .populate("theater", "name totalSeats");
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET showtimes for a specific movie
router.get("/movie/:movieId", verifyToken, async (req, res) => {
  try {
    const showtimes = await Showtime.find({ movie: req.params.movieId })
      .populate("movie", "title description duration posterURL")
      .populate("theater", "name totalSeats");
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single showtime by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate("movie", "title description duration posterURL")
      .populate("theater", "name totalSeats");
    if (!showtime) return res.status(404).json({ message: "Showtime not found" });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a showtime — admin only
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { movie, theater, showDate, showTime, price } = req.body;

    // Look up theater to get its actual seat count
    const theaterDoc = await Theater.findById(theater);
    if (!theaterDoc) return res.status(404).json({ message: "Theater not found" });

    const showtime = new Showtime({
      movie,
      theater,
      showDate,
      showTime,
      price,
      availableSeats: theaterDoc.totalSeats,
    });

    const savedShowtime = await showtime.save();
    const populatedShowtime = await Showtime.findById(savedShowtime._id)
      .populate("movie", "title description duration posterURL")
      .populate("theater", "name totalSeats");
    res.status(201).json(populatedShowtime);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a showtime — admin only
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedShowtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate("movie", "title description duration posterURL")
    .populate("theater", "name totalSeats");
    
    if (!updatedShowtime) return res.status(404).json({ message: "Showtime not found" });
    res.json(updatedShowtime);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a showtime — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedShowtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!deletedShowtime) return res.status(404).json({ message: "Showtime deleted" });
    res.json({ message: "Showtime deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
