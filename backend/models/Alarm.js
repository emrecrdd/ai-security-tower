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
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  objectType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  riskLevel: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    defaultValue: 'LOW'
  },
  aiVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // ✅ BBOX FIELD'INI EKLE
  bbox: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: "alarms",
  timestamps: false
});

Camera.hasMany(Alarm, { foreignKey: "cameraId" });
Alarm.belongsTo(Camera, { foreignKey: "cameraId" });

module.exports = Alarm;
