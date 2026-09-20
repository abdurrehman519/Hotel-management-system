const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RoomType = sequelize.define('RoomType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.TEXT },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
  amenities: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.TEXT },
}, { tableName: 'room_types', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = RoomType;
