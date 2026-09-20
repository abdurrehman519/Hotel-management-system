const RoomType = require('../models/RoomType');
const Room = require('../models/Room');

const getAll = async (req, res, next) => {
  try {
    const types = await RoomType.findAll({ include: [{ model: Room, as: 'rooms', attributes: ['id', 'status'] }] });
    res.json(types);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const type = await RoomType.findByPk(req.params.id, { include: [{ model: Room, as: 'rooms' }] });
    if (!type) return res.status(404).json({ message: 'Room type not found.' });
    res.json(type);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const type = await RoomType.create(req.body);
    res.status(201).json(type);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const type = await RoomType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: 'Room type not found.' });
    await type.update(req.body);
    res.json(type);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const type = await RoomType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: 'Room type not found.' });
    await type.destroy();
    res.json({ message: 'Room type deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
