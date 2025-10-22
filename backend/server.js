const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const logger = require("./utils/logger");

// 🔹 DB ve modeller
const sequelize = require("./config/database");
require("./models/Camera");
require("./models/Alarm");
require("./models/Report");

// 🔹 Ortam değişkenleri
dotenv.config();

// 🔹 Express + HTTP + Socket.IO kurulumu
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Router'lar
const routes = require("./routes");
app.use("/api", routes);

// 🔹 Basit test endpointi
app.get("/", (req, res) => {
  res.send("✅ Security Tower Backend Çalışıyor");
});

// 🔹 Socket.IO bağlantısı
io.on("connection", (socket) => {
  logger.info("🟢 Yeni bir client bağlandı");

  socket.on("disconnect", () => {
    logger.info("🔴 Client ayrıldı");
  });
});

// 🔹 Sequelize tablolarını senkronize et
sequelize
  .sync({ alter: true })
  .then(() => logger.info("✅ Veritabanı tabloları senkronize edildi"))
  .catch((err) => logger.error("❌ Tablolar senkronize edilemedi:", err));

// 🔹 Socket'i dışa aktar (controller'larda kullanılabilir)
// ✅ BU SATIRI EN SONA AL
module.exports = { io, server };

// 🔹 Sunucu başlatma
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});