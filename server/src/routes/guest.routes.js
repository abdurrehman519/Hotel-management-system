const router = require('express').Router();
const c = require('../controllers/guest.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getById);
router.post('/', authenticate, c.create);
router.put('/:id', authenticate, c.update);

module.exports = router;
