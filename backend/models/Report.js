// backend/models/Report.js - OLUŞTURUN
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Report = sequelize.define("Report", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reportType: {
    type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'),
    defaultValue: 'DAILY'
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  isSaved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "reports"
});

module.exports = Report;