const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) return res.status(401).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required.' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use.' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ full_name, email, password_hash, role });
    res.status(201).json({ id: user.id, full_name: user.full_name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res) => {
  res.json({ id: req.user.id, full_name: req.user.full_name, email: req.user.email, role: req.user.role });
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
    user.password_hash = await bcrypt.hash(new_password, 12);
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getProfile, changePassword };
