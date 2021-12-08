const tagController = require("../controllers/tag.controller");

const express = require("express");
const router = express.Router();

router.get("/", tagController.listTag);

module.exports = router;
