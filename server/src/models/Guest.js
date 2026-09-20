const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Guest = sequelize.define('Guest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), unique: true },
  phone: { type: DataTypes.STRING(20) },
  id_document_type: { type: DataTypes.STRING(50) },
  id_document_no: { type: DataTypes.STRING(50) },
  nationality: { type: DataTypes.STRING(60) },
  address: { type: DataTypes.TEXT },
}, { tableName: 'guests', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Guest;
