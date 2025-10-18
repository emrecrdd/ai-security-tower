const Alarm = require("../models/Alarm");
const { io } = require("../server"); // Eğer socket.io server export edildi ise

// Tüm alarmları listele
exports.getAllAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.findAll();
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tek alarm getir
exports.getAlarmById = async (req, res) => {
  try {
    const alarm = await Alarm.findByPk(req.params.id);
    if (!alarm) return res.status(404).json({ error: "Alarm bulunamadı" });
    res.json(alarm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Yeni alarm ekle
exports.createAlarm = async (req, res) => {
  try {
    const newAlarm = await Alarm.create(req.body);
    io.emit("newAlarm", newAlarm); // Tüm frontend’lere bildir
    res.status(201).json(newAlarm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Alarm sil
exports.deleteAlarm = async (req, res) => {
  try {
    const deleted = await Alarm.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Alarm bulunamadı" });
    res.json({ message: "Alarm silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
