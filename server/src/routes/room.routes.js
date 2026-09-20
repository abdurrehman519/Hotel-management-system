const router = require('express').Router();
const c = require('../controllers/room.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/available', c.getAvailable);
router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', authenticate, authorize('admin'), c.create);
router.put('/:id', authenticate, authorize('admin', 'receptionist'), c.update);
router.delete('/:id', authenticate, authorize('admin'), c.remove);

module.exports = router;
