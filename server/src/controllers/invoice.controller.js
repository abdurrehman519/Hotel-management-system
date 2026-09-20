const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Payment = require('../models/Payment');

const includes = [
  {
    model: Booking,
    as: 'booking',
    include: [
      { model: Guest, as: 'guest' },
      { model: Room, as: 'room', include: [{ model: RoomType, as: 'roomType' }] },
    ],
  },
  { model: Payment, as: 'payments' },
];

const getById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, { include: includes });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
    res.json(invoice);
  } catch (err) { next(err); }
};

const getByBooking = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ where: { booking_id: req.params.bookingId }, include: includes });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
    res.json(invoice);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
    const allowed = ['extra_charges', 'discount_amount', 'tax_rate', 'notes'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const subtotal = parseFloat(invoice.room_charges) + parseFloat(updates.extra_charges ?? invoice.extra_charges) - parseFloat(updates.discount_amount ?? invoice.discount_amount);
    const taxRate = parseFloat(updates.tax_rate ?? invoice.tax_rate);
    const tax_amount = (subtotal * taxRate) / 100;
    updates.subtotal = subtotal;
    updates.tax_amount = tax_amount;
    updates.total = subtotal + tax_amount;
    await invoice.update(updates);
    const updated = await Invoice.findByPk(invoice.id, { include: includes });
    res.json(updated);
  } catch (err) { next(err); }
};

module.exports = { getById, getByBooking, update };
