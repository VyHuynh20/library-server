const bookcaseController = require("../controllers/bookcase.controller");

const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

router.get("/books/", authUser, bookcaseController.listBookInBookcase);
router.get("/", authUser, bookcaseController.get);
router.get(
  "/getBookInBookcase/:_id",
  authUser,
  bookcaseController.getBookInBookcase
);
router.delete(
  "/deleteBookInBookcase/:bookId",
  authUser,
  bookcaseController.deleteBook
);

//NOTE: post buy book - add book in bookcase
router.post("/buyBook/", authUser, bookcaseController.buyBook);

//NOTE: post buy book and read now
router.post("/buyBookAndReadNow/", authUser, bookcaseController.buyAndReadNow);

//NOTE: refund 50% hoa when complete book in bookcase
router.get("/refund/", authUser, bookcaseController.refundBook);

module.exports = router;
