const express = require("express");
const router = express.Router();
const alarmController = require("../controllers/alarmController");

router.get("/", alarmController.getAllAlarms);
router.get("/:id", alarmController.getAlarmById);
router.post("/", alarmController.createAlarm);
router.delete("/:id", alarmController.deleteAlarm);

module.exports = router;
