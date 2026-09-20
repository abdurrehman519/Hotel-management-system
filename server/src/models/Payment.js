const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Invoice = require('./Invoice');
const User = require('./User');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Invoice, key: 'id' } },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.ENUM('cash', 'card', 'bank_transfer'), allowNull: false },
  reference_no: { type: DataTypes.STRING(100) },
  notes: { type: DataTypes.TEXT },
  recorded_by: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
  paid_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'payments', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
Invoice.hasMany(Payment, { foreignKey: 'invoice_id', as: 'payments' });

module.exports = Payment;
