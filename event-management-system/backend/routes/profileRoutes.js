const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getVendorProfile,
  getAdminProfile
} = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/user/:id', authMiddleware, getUserProfile);
router.get('/vendor/:id', authMiddleware, getVendorProfile);
router.get('/admin/:id', authMiddleware, getAdminProfile);

module.exports = router; 