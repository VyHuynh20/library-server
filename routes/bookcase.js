const bookcaseController = require("../controllers/bookcase.controller");

const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

router.get("/", authUser, bookcaseController.listBook);

module.exports = router;
