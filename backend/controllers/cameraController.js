const  Camera  = require("../models/Camera");

// Tüm kameraları listele
exports.getAllCameras = async (req, res) => {
  try {
    const cameras = await Camera.findAll();
    res.json(cameras);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tek kamera detaya
exports.getCameraById = async (req, res) => {
  try {
    const camera = await Camera.findByPk(req.params.id);
    if (!camera) return res.status(404).json({ error: "Kamera bulunamadı" });
    res.json(camera);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Yeni kamera ekle
exports.createCamera = async (req, res) => {
  try {
    const newCamera = await Camera.create(req.body);
    res.status(201).json(newCamera);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Kamera sil
exports.deleteCamera = async (req, res) => {
  try {
    const deleted = await Camera.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Kamera bulunamadı" });
    res.json({ message: "Kamera silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
