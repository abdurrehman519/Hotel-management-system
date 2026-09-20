const router = require('express').Router();
const c = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, c.create);
router.get('/invoice/:invoiceId', authenticate, c.getByInvoice);

module.exports = router;
