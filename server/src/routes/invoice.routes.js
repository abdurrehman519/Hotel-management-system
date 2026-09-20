const router = require('express').Router();
const c = require('../controllers/invoice.controller');
const { authenticate } = require('../middleware/auth');

router.get('/booking/:bookingId', authenticate, c.getByBooking);
router.get('/:id', authenticate, c.getById);
router.put('/:id', authenticate, c.update);

module.exports = router;
