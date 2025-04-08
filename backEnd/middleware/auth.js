const jwt = require("jsonwebtoken");
const db = require("../config/database");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check in both users and babysitters tables
    let [users] = await db.query(
      "SELECT * FROM users WHERE id = ? AND is_active = 1",
      [decoded.id]
    );

    let [babysitters] = await db.query(
      "SELECT * FROM babysitters WHERE id = ? AND is_active = 1",
      [decoded.id]
    );

    const user = users[0] || babysitters[0];

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Please authenticate." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};

module.exports = { auth, authorize };
