const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

const includes = [
  { model: Guest, as: 'guest' },
  { model: Room, as: 'room', include: [{ model: RoomType, as: 'roomType' }] },
  { model: Invoice, as: 'invoice' },
  { model: User, as: 'createdBy', attributes: ['id', 'full_name'] },
];

const getAll = async (req, res, next) => {
  try {
    const { status, date_from, date_to, guest_id, room_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (guest_id) where.guest_id = guest_id;
    if (room_id) where.room_id = room_id;
    if (date_from && date_to) {
      where.check_in_date = { [Op.between]: [date_from, date_to] };
    }
    const bookings = await Booking.findAll({ where, include: includes, order: [['created_at', 'DESC']] });
    res.json(bookings);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, { include: includes });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(booking);
  } catch (err) { next(err); }
};

// Resolve a guest_id from either an existing guest_id, or a nested guest
// object { first_name, last_name, email, phone, id_number } sent by the
// public booking form / staff booking form. Finds an existing guest by
// email first (so repeat guests don't get duplicated), otherwise creates one.
const resolveGuestId = async (body, t) => {
  if (body.guest_id) return body.guest_id;

  const g = body.guest;
  if (!g || (!g.email && !g.first_name && !g.last_name)) {
    const err = new Error('guest_id or guest details are required.');
    err.statusCode = 400;
    throw err;
  }

  const full_name = g.full_name || `${g.first_name || ''} ${g.last_name || ''}`.trim();

  if (g.email) {
    const existing = await Guest.findOne({ where: { email: g.email }, transaction: t });
    if (existing) return existing.id;
  }

  const created = await Guest.create(
    {
      full_name,
      email: g.email || null,
      phone: g.phone || null,
      id_document_no: g.id_number || g.id_document_no || null,
    },
    { transaction: t }
  );
  return created.id;
};

const generateBookingReference = () => {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BK-${new Date().getFullYear()}-${rand}`;
};

const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { room_id, check_in_date, check_out_date, special_requests } = req.body;
    const guests_count = req.body.guests_count;
    const adults = req.body.adults ?? guests_count ?? 1;
    const children = req.body.children ?? 0;

    const guest_id = await resolveGuestId(req.body, t);

    const room = await Room.findByPk(room_id, { include: [{ model: RoomType, as: 'roomType' }], transaction: t });
    if (!room) { await t.rollback(); return res.status(404).json({ message: 'Room not found.' }); }
    if (room.status === 'maintenance') {
      await t.rollback();
      return res.status(409).json({ message: 'This room is under maintenance and cannot be booked.' });
    }

    const conflicting = await Booking.findOne({
      where: {
        room_id,
        status: { [Op.notIn]: ['cancelled', 'no_show', 'checked_out'] },
        [Op.or]: [
          { check_in_date: { [Op.between]: [check_in_date, check_out_date] } },
          { check_out_date: { [Op.between]: [check_in_date, check_out_date] } },
          { [Op.and]: [{ check_in_date: { [Op.lte]: check_in_date } }, { check_out_date: { [Op.gte]: check_out_date } }] },
        ],
      },
      transaction: t,
    });
    if (conflicting) {
      await t.rollback();
      return res.status(409).json({ message: 'Room is not available for the selected dates.' });
    }

    const nights = Math.ceil((new Date(check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24));
    const total_amount = parseFloat(room.roomType.base_price) * nights;

    const booking = await Booking.create(
      {
        booking_reference: generateBookingReference(),
        guest_id,
        room_id,
        check_in_date,
        check_out_date,
        adults,
        children,
        special_requests,
        total_amount,
        status: 'confirmed',
        created_by: req.user?.id || null,
      },
      { transaction: t }
    );

    const tax_rate = 10;
    const subtotal = total_amount;
    const tax_amount = (subtotal * tax_rate) / 100;
    const total = subtotal + tax_amount;

    await Invoice.create(
      { booking_id: booking.id, room_charges: total_amount, subtotal, tax_rate, tax_amount, total, status: 'unpaid' },
      { transaction: t }
    );

    await t.commit();
    const created = await Booking.findByPk(booking.id, { include: includes });
    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    const allowed = ['check_in_date', 'check_out_date', 'adults', 'children', 'special_requests', 'status'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await booking.update(updates);
    const updated = await Booking.findByPk(booking.id, { include: includes });
    res.json(updated);
  } catch (err) { next(err); }
};

const checkIn = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id, { transaction: t });
    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Booking not found.' }); }
    if (booking.status !== 'confirmed') { await t.rollback(); return res.status(400).json({ message: 'Booking must be confirmed to check in.' }); }
    await booking.update({ status: 'checked_in', checked_in_by: req.user.id }, { transaction: t });
    await Room.update({ status: 'occupied' }, { where: { id: booking.room_id }, transaction: t });
    await t.commit();
    res.json({ message: 'Guest checked in successfully.' });
  } catch (err) { await t.rollback(); next(err); }
};

const checkOut = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id, { include: [{ model: Invoice, as: 'invoice' }], transaction: t });
    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Booking not found.' }); }
    if (booking.status !== 'checked_in') { await t.rollback(); return res.status(400).json({ message: 'Guest must be checked in to check out.' }); }
    await booking.update({ status: 'checked_out', checked_out_by: req.user.id }, { transaction: t });
    await Room.update({ status: 'available' }, { where: { id: booking.room_id }, transaction: t });
    await t.commit();
    res.json({ message: 'Guest checked out. Invoice finalized.', invoice_id: booking.invoice?.id });
  } catch (err) { await t.rollback(); next(err); }
};

const cancel = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id, { transaction: t });
    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Booking not found.' }); }
    if (['checked_in', 'checked_out', 'cancelled'].includes(booking.status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Cannot cancel this booking.' });
    }
    await booking.update({ status: 'cancelled', cancellation_reason: req.body.reason || null }, { transaction: t });
    await t.commit();
    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) { await t.rollback(); next(err); }
};

module.exports = { getAll, getById, create, update, checkIn, checkOut, cancel };
