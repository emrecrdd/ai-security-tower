const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     // Veritabanı adı
  process.env.DB_USER,     // Kullanıcı adı
  process.env.DB_PASSWORD, // Şifre
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false, // true olursa SQL loglarını görebilirsin
  }
);

module.exports = sequelize;
