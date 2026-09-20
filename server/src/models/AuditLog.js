const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
  action: { type: DataTypes.STRING(50), allowNull: false },
  entity: { type: DataTypes.STRING(50), allowNull: false },
  entity_id: { type: DataTypes.INTEGER },
  details: { type: DataTypes.TEXT },
  ip_address: { type: DataTypes.STRING(45) },
}, { tableName: 'audit_logs', timestamps: true, createdAt: 'created_at', updatedAt: false });

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = AuditLog;
