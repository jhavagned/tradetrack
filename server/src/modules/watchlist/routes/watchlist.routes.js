// /server/src/modules/watchlist/routes/watchlist.routes.js

const express = require("express");
const WatchlistController = require("../controllers/watchlist.controller");
const authMiddleware = require("../../../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", WatchlistController.getWatchlist);
router.get("/quotes", WatchlistController.getQuotes);
router.post("/", WatchlistController.addItem);
router.delete("/:id", WatchlistController.removeItem);

module.exports = router;
