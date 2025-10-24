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
    origin: ["https://thunderous-naiad-6c6b88.netlify.app"],
    methods: ["GET","POST"]
  }
});

// 🔹 Middleware - ✅ LIMIT EKLENDI!
app.use(cors());
app.use(express.json({ limit: '50mb' })); // ✅ Base64 için büyük limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// 🔹 Global io objesi - ✅ BU SATIR EKLENDI!
global.io = io;

// 🔹 Sequelize tablolarını senkronize et
sequelize
  .sync({ alter: true })
  .then(() => logger.info("✅ Veritabanı tabloları senkronize edildi"))
  .catch((err) => logger.error("❌ Tablolar senkronize edilemedi:", err));

// 🔹 Socket'i dışa aktar (controller'larda kullanılabilir)
module.exports = { io, server };

// 🔹 Sunucu başlatma
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});
