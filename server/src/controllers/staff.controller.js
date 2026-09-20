const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getAll = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] }, order: [['full_name', 'ASC']] });
    res.json(users);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    if (!user) return res.status(404).json({ message: 'Staff member not found.' });
    res.json(user);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use.' });
    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ full_name, email, password_hash, role });
    res.status(201).json({ id: user.id, full_name: user.full_name, email: user.email, role: user.role, is_active: user.is_active });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Staff member not found.' });
    const allowed = ['full_name', 'role', 'is_active'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (req.body.password) updates.password_hash = await bcrypt.hash(req.body.password, 12);
    await user.update(updates);
    res.json({ id: user.id, full_name: user.full_name, email: user.email, role: user.role, is_active: user.is_active });
  } catch (err) { next(err); }
};

const deactivate = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Staff member not found.' });
    await user.update({ is_active: false });
    res.json({ message: 'Staff account deactivated.' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, deactivate };
