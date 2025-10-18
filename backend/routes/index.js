const express = require("express");
const router = express.Router();

const alarmRoutes = require("./alarms");
const cameraRoutes = require("./cameras");

router.use("/alarms", alarmRoutes);
router.use("/cameras", cameraRoutes);

module.exports = router;
