const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Guest = require('./Guest');
const Room = require('./Room');
const User = require('./User');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_reference: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  guest_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Guest, key: 'id' } },
  room_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Room, key: 'id' } },
  check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
  check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
  adults: { type: DataTypes.INTEGER, defaultValue: 1 },
  children: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'),
    defaultValue: 'pending',
  },
  total_amount: { type: DataTypes.DECIMAL(10, 2) },
  special_requests: { type: DataTypes.TEXT },
  created_by: { type: DataTypes.INTEGER, references: { model: User, key: 'id' }, allowNull: true },
  checked_in_by: { type: DataTypes.INTEGER, references: { model: User, key: 'id' }, allowNull: true },
  checked_out_by: { type: DataTypes.INTEGER, references: { model: User, key: 'id' }, allowNull: true },
  cancellation_reason: { type: DataTypes.TEXT },
}, { tableName: 'bookings', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

Booking.beforeValidate((booking) => {
  if (!booking.booking_reference) {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    booking.booking_reference = `BK-${new Date().getFullYear()}-${rand}`;
  }
});

Booking.belongsTo(Guest, { foreignKey: 'guest_id', as: 'guest' });
Booking.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
Booking.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });

Guest.hasMany(Booking, { foreignKey: 'guest_id', as: 'bookings' });
Room.hasMany(Booking, { foreignKey: 'room_id', as: 'bookings' });

module.exports = Booking;
