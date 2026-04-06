import express from "express";
import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all bookings — admin sees all, standard user sees only their own
router.get("/", verifyToken, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === "admin") {
      bookings = await Booking.find()
        .populate({
          path: "showtime",
          populate: [
            { path: "movie", select: "title" },
            { path: "theater", select: "name" },
          ],
        });
    } else {
      bookings = await Booking.find({ customerName: req.user.username })
        .populate({
          path: "showtime",
          populate: [
            { path: "movie", select: "title" },
            { path: "theater", select: "name" },
          ],
        });
    }
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single booking by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "showtime",
        populate: [
          { path: "movie", select: "title" },
          { path: "theater", select: "name" },
        ],
      });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Standard users can only view their own bookings
    if (req.user.role !== "admin" && booking.customerName !== req.user.username) {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a booking — any logged-in user
router.post("/", verifyToken, async (req, res) => {
  try {
    const { showtime, seats } = req.body;

    if (!seats || seats.length === 0) {
      return res.status(400).json({ message: "At least one seat must be selected" });
    }

    const uniqueSeats = [...new Set(seats)];
    if (uniqueSeats.length !== seats.length) {
      return res.status(400).json({ message: "Duplicate seats are not allowed" });
    }

    const selectedShowtime = await Showtime.findById(showtime);
    if (!selectedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const existingBookings = await Booking.find({ showtime });
    const alreadyBookedSeats = existingBookings.flatMap((booking) => booking.seats);

    const conflictingSeats = seats.filter((seat) => alreadyBookedSeats.includes(seat));
      if (conflictingSeats.length > 0) {
        return res.status(400).json({
          message: `These seats are already booked: ${conflictingSeats.join(", ")}`,
        });
      }

    if (selectedShowtime.availableSeats < seats.length) {
      return res.status(400).json({ message: "Not enough available seats" });
    }

    const totalPrice = selectedShowtime.price * seats.length;

    const booking = new Booking({
      customerName: req.user.username, // tied to the logged-in user
      showtime,
      seats,
      totalPrice,
    });

    const savedBooking = await booking.save();

    selectedShowtime.availableSeats -= seats.length;
    await selectedShowtime.save();

    res.status(201).json(savedBooking);
  } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// PUT update a booking — user can only update their own
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Ownership check
    if (req.user.role !== "admin" && booking.customerName !== req.user.username) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a booking — user can only delete their own, admin can delete any
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Ownership check
    if (req.user.role !== "admin" && booking.customerName !== req.user.username) {
      return res.status(403).json({ message: "Not authorized to delete this booking" });
    }

    const selectedShowtime = await Showtime.findById(booking.showtime);

    if (selectedShowtime) {
      selectedShowtime.availableSeats += booking.seats.length;
      await selectedShowtime.save();
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;