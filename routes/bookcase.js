const bookcaseController = require("../controllers/bookcase.controller");

const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

router.get("/books/", authUser, bookcaseController.listBookInBookcase);
router.get("/", authUser, bookcaseController.get);

//NOTE: post buy book - add book in bookcase
router.post("/buyBook/", authUser, bookcaseController.buyBook);

//NOTE: post buy book and read now
router.post("/buyBookAndReadNow/", authUser, bookcaseController.buyAndReadNow);

module.exports = router;
