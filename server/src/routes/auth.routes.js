const router = require('express').Router();
const { login, register, getProfile, changePassword } = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', authenticate, authorize('admin'), register);
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
