const noteController = require("../controllers/note.controller");

const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

router.get("/", authUser, noteController.listNoteinBookcase);
router.get("/:bookId", authUser, noteController.detailNoteinBook);

module.exports = router;
