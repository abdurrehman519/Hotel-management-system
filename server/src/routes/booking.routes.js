const router = require('express').Router();
const c = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getById);
router.post('/', c.create);
router.put('/:id', authenticate, c.update);
router.post('/:id/check-in', authenticate, authorize('admin', 'manager', 'receptionist'), c.checkIn);
router.post('/:id/check-out', authenticate, authorize('admin', 'manager', 'receptionist'), c.checkOut);
router.post('/:id/cancel', authenticate, c.cancel);

module.exports = router;
