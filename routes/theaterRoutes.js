import express from "express";
import Theater from "../models/Theater.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all theaters — any logged-in user can view
router.get("/", verifyToken, async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.json(theaters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single theater by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ message: "Theater not found" });
    res.json(theater);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a theater — admin only
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, totalSeats } = req.body;
    const theater = new Theater({ name, totalSeats });
    const savedTheater = await theater.save();
    res.status(201).json(savedTheater);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a theater — admin only
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedTheater = await Theater.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTheater) return res.status(404).json({ message: "Theater not found" });
    res.json(updatedTheater);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a theater — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedTheater = await Theater.findByIdAndDelete(req.params.id);
    if (!deletedTheater) return res.status(404).json({ message: "Theater not found" });
    res.json({ message: "Theater deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;