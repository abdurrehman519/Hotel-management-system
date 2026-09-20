const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Guest = require('../models/Guest');
const RoomType = require('../models/RoomType');

const occupancy = async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const from = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = date_to || new Date().toISOString().split('T')[0];

    const totalRooms = await Room.count();
    const bookings = await Booking.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled', 'no_show'] },
        check_in_date: { [Op.lte]: to },
        check_out_date: { [Op.gte]: from },
      },
      attributes: ['check_in_date', 'check_out_date'],
    });

    const occupancyRate = totalRooms > 0 ? Math.round((bookings.length / totalRooms) * 100) : 0;
    const today = new Date().toISOString().split('T')[0];
    const todayOccupied = await Room.count({ where: { status: 'occupied' } });
    const todayArrivals = await Booking.count({ where: { check_in_date: today, status: { [Op.in]: ['confirmed', 'checked_in'] } } });
    const todayDepartures = await Booking.count({ where: { check_out_date: today, status: 'checked_in' } });

    res.json({ total_rooms: totalRooms, occupied_rooms: todayOccupied, occupancy_rate: occupancyRate, today_arrivals: todayArrivals, today_departures: todayDepartures });
  } catch (err) { next(err); }
};

const revenue = async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const from = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = date_to || new Date().toISOString().split('T')[0];

    const payments = await Payment.findAll({
      where: { paid_at: { [Op.between]: [from, to] } },
      attributes: ['amount', 'method', 'paid_at'],
      order: [['paid_at', 'ASC']],
    });

    const totalRevenue = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + parseFloat(p.amount);
      return acc;
    }, {});

    const invoiceStats = await Invoice.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('total')), 'total']],
      group: ['status'],
    });

    res.json({ total_revenue: totalRevenue, by_method: byMethod, payments, invoice_stats: invoiceStats });
  } catch (err) { next(err); }
};

const dashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalRooms = await Room.count();
    const availableRooms = await Room.count({ where: { status: 'available' } });
    const occupiedRooms = await Room.count({ where: { status: 'occupied' } });
    const maintenanceRooms = await Room.count({ where: { status: 'maintenance' } });
    const todayArrivals = await Booking.findAll({ where: { check_in_date: today, status: 'confirmed' }, include: [{ model: Guest, as: 'guest' }, { model: Room, as: 'room' }], limit: 10 });
    const todayDepartures = await Booking.findAll({ where: { check_out_date: today, status: 'checked_in' }, include: [{ model: Guest, as: 'guest' }, { model: Room, as: 'room' }], limit: 10 });
    const totalGuests = await Guest.count();
    const totalBookings = await Booking.count();
    const activeBookings = await Booking.count({ where: { status: { [Op.in]: ['confirmed', 'checked_in'] } } });
    const totalPayments = await Payment.sum('amount') || 0;

    res.json({
      data: {
        rooms: { total: totalRooms, available: availableRooms, occupied: occupiedRooms, maintenance: maintenanceRooms },
        today_arrivals: todayArrivals,
        today_departures: todayDepartures,
        stats: { total_guests: totalGuests, total_bookings: totalBookings, active_bookings: activeBookings, total_revenue: totalPayments },
      }
    });
  } catch (err) { next(err); }
};

module.exports = { occupancy, revenue, dashboard };
