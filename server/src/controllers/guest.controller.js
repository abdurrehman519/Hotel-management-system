const Guest = require('../models/Guest');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    const guests = await Guest.findAll({ where, order: [['full_name', 'ASC']] });
    res.json(guests);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found.' });
    res.json(guest);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const guest = await Guest.create(req.body);
    res.status(201).json(guest);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found.' });
    await guest.update(req.body);
    res.json(guest);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update };
