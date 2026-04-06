import express from "express";
import Movie from "../models/Movie.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().populate("genres", "name");
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate("genres", "name");
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new movie — admin only
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, duration, posterUrl, genres } = req.body;
    const movie = new Movie({ title, description, duration, posterUrl, genres });
    const savedMovie = await movie.save();
    const populatedMovie = await Movie.findById(savedMovie._id).populate("genres", "name");
    res.status(201).json(savedMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a movie by ID — admin only
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("genres", "name");
    if (!updatedMovie) return res.status(404).json({ message: "Movie not found" });
    res.json(updatedMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a movie by ID — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
