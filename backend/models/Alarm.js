// backend/models/Alarm.js - GÜNCELLENMİŞ
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Camera = require("./Camera");

const Alarm = sequelize.define("Alarm", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cameraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Camera,
      key: "id"
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // YENİ ALANLAR - AI ve Raporlama için
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  objectType: {
    type: DataTypes.STRING, // 'person', 'car', 'truck'
    allowNull: true
  },
  location: {
    type: DataTypes.JSON, // {x1, y1, x2, y2} koordinatları
    allowNull: true
  },
  riskLevel: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    defaultValue: 'LOW'
  },
  aiVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "alarms",
  timestamps: false
});

Camera.hasMany(Alarm, { foreignKey: "cameraId" });
Alarm.belongsTo(Camera, { foreignKey: "cameraId" });

module.exports = Alarm; 