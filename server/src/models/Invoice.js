const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: Booking, key: 'id' } },
  room_charges: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  extra_charges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  tax_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'refunded'), defaultValue: 'unpaid' },
  notes: { type: DataTypes.TEXT },
  issued_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'invoices', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

Invoice.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Booking.hasOne(Invoice, { foreignKey: 'booking_id', as: 'invoice' });

module.exports = Invoice;
