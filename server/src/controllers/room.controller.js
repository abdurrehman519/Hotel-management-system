const { Op } = require('sequelize');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');

const getAll = async (req, res, next) => {
  try {
    const { status, room_type_id, floor } = req.query;
    const where = {};
    if (status) where.status = status;
    if (room_type_id) where.room_type_id = room_type_id;
    if (floor) where.floor = floor;
    const rooms = await Room.findAll({ where, include: [{ model: RoomType, as: 'roomType' }], order: [['room_number', 'ASC']] });
    res.json(rooms);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id, { include: [{ model: RoomType, as: 'roomType' }] });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (err) { next(err); }
};

const getAvailable = async (req, res, next) => {
  try {
    const { check_in_date, check_out_date, room_type_id, capacity } = req.query;
    if (!check_in_date || !check_out_date) return res.status(400).json({ message: 'Check-in and check-out dates are required.' });

    const bookedRoomIds = await Booking.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled', 'no_show', 'checked_out'] },
        [Op.or]: [
          { check_in_date: { [Op.between]: [check_in_date, check_out_date] } },
          { check_out_date: { [Op.between]: [check_in_date, check_out_date] } },
          { [Op.and]: [{ check_in_date: { [Op.lte]: check_in_date } }, { check_out_date: { [Op.gte]: check_out_date } }] },
        ],
      },
      attributes: ['room_id'],
    });

    const excludedIds = bookedRoomIds.map((b) => b.room_id);
    const where = { status: 'available' };
    if (excludedIds.length) where.id = { [Op.notIn]: excludedIds };
    if (room_type_id) where.room_type_id = room_type_id;

    const typeWhere = {};
    if (capacity) typeWhere.capacity = { [Op.gte]: capacity };

    const rooms = await Room.findAll({
      where,
      include: [{ model: RoomType, as: 'roomType', where: typeWhere }],
      order: [['room_number', 'ASC']],
    });
    res.json(rooms);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    await room.update(req.body);
    res.json(room);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    await room.destroy();
    res.json({ message: 'Room deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getAvailable, create, update, remove };
