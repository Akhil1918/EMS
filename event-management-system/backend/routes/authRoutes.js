const express = require("express");
const { registerUser, loginUser, updateUserProfile, getCurrentUser, checkSession } = require("../controllers/authController");
const { updateEquipment } = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", authMiddleware, updateUserProfile);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/check-session", authMiddleware, checkSession);

module.exports = router;
