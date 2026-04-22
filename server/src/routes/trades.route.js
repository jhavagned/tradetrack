const express = require("express");
const TradesController = require("../controllers/trades.controller");

const router = express.Router();

router.get("/", TradesController.getAll);
router.post("/", TradesController.create);

module.exports = router;