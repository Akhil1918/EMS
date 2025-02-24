const { protect } = require("./authMiddleware"); // Protect middleware to verify JWT

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
};

module.exports = { adminMiddleware };
