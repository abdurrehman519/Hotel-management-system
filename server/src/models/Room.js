const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const RoomType = require('./RoomType');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  room_number: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  room_type_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: RoomType, key: 'id' } },
  floor: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('available', 'occupied', 'maintenance'), defaultValue: 'available' },
  image_url: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'rooms', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

Room.belongsTo(RoomType, { foreignKey: 'room_type_id', as: 'roomType' });
RoomType.hasMany(Room, { foreignKey: 'room_type_id', as: 'rooms' });

module.exports = Room;
