const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload");
const carController = require("../controllers/carController");

router.get('/', carController.getAllCars);
router.get("/:id", carController.getCarById);

// ĐÃ SỬA: Dùng upload.array để nhận nhiều file cùng lúc với key là "images"
router.post("/", upload.array("images", 10), carController.createCar);
router.put("/:id", upload.array("images", 10), carController.updateCar);

router.delete("/:id", carController.deleteCar);

module.exports = router;