const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Camera = sequelize.define("Camera", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "cameras",
  timestamps: false
});

module.exports = Camera;
