const router = require('express').Router();
const c = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticate, c.dashboard);
router.get('/occupancy', authenticate, authorize('admin', 'manager'), c.occupancy);
router.get('/revenue', authenticate, authorize('admin', 'manager'), c.revenue);

module.exports = router;
