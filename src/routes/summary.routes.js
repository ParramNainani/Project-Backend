const { Router } = require('express');
const summaryController = require('../controllers/summary.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();

// All authenticated users can view the dashboard
router.get('/dashboard', requireAuth, summaryController.getDashboard);

module.exports = router;
