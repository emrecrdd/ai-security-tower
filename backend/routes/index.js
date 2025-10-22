// backend/routes/index.js - GÜNCELLENMİŞ
const express = require("express");
const router = express.Router();

const alarmRoutes = require("./alarms");
const cameraRoutes = require("./cameras");
const reportRoutes = require("./reports"); // YENİ
const aiRoutes = require("./ai"); // YENİ

router.use("/alarms", alarmRoutes);
router.use("/cameras", cameraRoutes);
router.use("/reports", reportRoutes); // YENİ
router.use("/ai", aiRoutes); // YENİ

module.exports = router;