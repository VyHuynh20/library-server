const tagController = require("../controllers/tag.controller");

const express = require("express");
const router = express.Router();

router.get("/", tagController.listTag);
router.get("/others", tagController.getTagOther);

module.exports = router;
