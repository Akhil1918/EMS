const express = require('express');
const { getCurrentUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getCurrentUserStats);

module.exports = router; 