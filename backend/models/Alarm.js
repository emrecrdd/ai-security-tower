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
  }
}, {
  tableName: "alarms",
  timestamps: false
});

Camera.hasMany(Alarm, { foreignKey: "cameraId" });
Alarm.belongsTo(Camera, { foreignKey: "cameraId" });

module.exports = Alarm;
