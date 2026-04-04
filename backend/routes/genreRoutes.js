import express from "express";
import Genre from "../models/Genre.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all genres — any user can view
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a genre — admin only
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const genre = new Genre({ name });
    const savedGenre = await genre.save();
    res.status(201).json(savedGenre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a genre — admin only
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedGenre) return res.status(404).json({ message: "Genre not found" });
    res.json(updatedGenre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a genre — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedGenre = await Genre.findByIdAndDelete(req.params.id);
    if (!deletedGenre) return res.status(404).json({ message: "Genre not found" });
    res.json({ message: "Genre deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;