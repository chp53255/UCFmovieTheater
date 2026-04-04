import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST register a new user — public, no auth needed
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      role: role || "user",
    });

    const savedUser = await user.save();

    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST login — public, no auth needed
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users — admin only
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single user by ID — user can view themselves, admin can view anyone
router.get("/:id", verifyToken, async (req, res) => {
  try {
    // Standard users can only look up their own profile
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to view this user" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update a user — user can update themselves, admin can update anyone
router.put("/:id", verifyToken, async (req, res) => {
  try {
    // Standard users can only update their own profile
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to update this user" });
    }

    // If they're changing their password, hash it first
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Prevent standard users from promoting themselves to admin
    if (req.user.role !== "admin" && req.body.role) {
      delete req.body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;