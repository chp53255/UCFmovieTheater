import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Movie from "./models/Movie.js";
import Genre from "./models/Genre.js";
import Theater from "./models/Theater.js";
import Showtime from "./models/Showtime.js";
import Booking from "./models/Booking.js";

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    await Theater.deleteMany({});
    await Showtime.deleteMany({});
    await Booking.deleteMany({});
    console.log("Cleared existing data");

    // Create users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin123", salt);
    const userPassword = await bcrypt.hash("user123", salt);

    const users = await User.insertMany([
      { username: "admin", password: adminPassword, role: "admin" },
      { username: "john", password: userPassword, role: "user" },
      { username: "jane", password: userPassword, role: "user" },
    ]);
    console.log("Users seeded");

    // Create genres
    const genres = await Genre.insertMany([
      { name: "Action" },
      { name: "Sci-Fi" },
      { name: "Drama" },
      { name: "Animation" },
      { name: "Comedy" },
      { name: "Thriller" },
      { name: "Adventure" },
    ]);
    console.log("Genres seeded");

    // Create movies with genre references (many-to-many)
    const movies = await Movie.insertMany([
      {
        title: "The Batman",
        description: "Gotham's vigilante detective uncovers corruption.",
        duration: 176,
        genres: [genres[0]._id, genres[2]._id, genres[5]._id], // Action, Drama, Thriller
      },
      {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with the Fremen.",
        duration: 166,
        genres: [genres[1]._id, genres[6]._id, genres[2]._id], // Sci-Fi, Adventure, Drama
      },
      {
        title: "Oppenheimer",
        description: "The story of the atomic bomb's creation.",
        duration: 180,
        genres: [genres[2]._id, genres[5]._id], // Drama, Thriller
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales journeys across the multiverse.",
        duration: 140,
        genres: [genres[0]._id, genres[3]._id, genres[6]._id], // Action, Animation, Adventure
      },
      {
        title: "Inside Out 2",
        description: "Riley faces new emotions as a teenager.",
        duration: 100,
        genres: [genres[3]._id, genres[4]._id], // Animation, Comedy
      },
    ]);
    console.log("Movies seeded");

    // Create theaters
    const theaters = await Theater.insertMany([
      { name: "Theater A", totalSeats: 100 },
      { name: "Theater B", totalSeats: 75 },
      { name: "Theater C", totalSeats: 50 },
    ]);
    console.log("Theaters seeded");

    // Create showtimes
    const showtimes = await Showtime.insertMany([
      {
        movie: movies[0]._id,
        theater: theaters[0]._id,
        showDate: "2026-04-10",
        showTime: "7:00 PM",
        price: 12,
      },
      {
        movie: movies[0]._id,
        theater: theaters[1]._id,
        showDate: "2026-04-10",
        showTime: "9:30 PM",
        price: 15,
      },
      {
        movie: movies[1]._id,
        theater: theaters[0]._id,
        showDate: "2026-04-11",
        showTime: "6:00 PM",
        price: 12,
      },
      {
        movie: movies[2]._id,
        theater: theaters[2]._id,
        showDate: "2026-04-11",
        showTime: "8:00 PM",
        price: 10,
      },
      {
        movie: movies[3]._id,
        theater: theaters[1]._id,
        showDate: "2026-04-12",
        showTime: "3:00 PM",
        price: 12,
      },
    ]);
    console.log("Showtimes seeded");

    // Create bookings
    await Booking.insertMany([
      {
        customerName: "john",
        showtime: showtimes[0]._id,
        seats: ["A1", "A2"],
        totalPrice: 24,
      },
      {
        customerName: "jane",
        showtime: showtimes[2]._id,
        seats: ["B5"],
        totalPrice: 12,
      },
    ]);
    console.log("Bookings seeded");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDB();
