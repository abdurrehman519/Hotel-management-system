const router = require('express').Router();
const c = require('../controllers/staff.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), c.getAll);
router.get('/:id', authenticate, authorize('admin'), c.getById);
router.post('/', authenticate, authorize('admin'), c.create);
router.put('/:id', authenticate, authorize('admin'), c.update);
router.delete('/:id', authenticate, authorize('admin'), c.deactivate);

module.exports = router;
