const express = require('express');
const { statsController } = require('../controllers');
const { auth, admin } = require('../middleware');

const router = express.Router();

// All routes require admin authentication
router.use(auth, admin);

router.get('/dashboard', statsController.getDashboardStats);
router.get('/trends', statsController.getBorrowTrends);

module.exports = router;
