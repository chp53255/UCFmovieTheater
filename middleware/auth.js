import jwt from "jsonwebtoken";

// Verifies the token exists and is valid
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches { id, username, role } to the request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Checks if the authenticated user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};