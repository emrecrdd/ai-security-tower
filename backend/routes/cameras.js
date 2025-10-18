const express = require("express");
const router = express.Router();
const cameraController = require("../controllers/cameraController");

router.get("/", cameraController.getAllCameras);
router.get("/:id", cameraController.getCameraById);
router.post("/", cameraController.createCamera);
router.delete("/:id", cameraController.deleteCamera);

module.exports = router;
