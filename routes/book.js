const bookController = require("../controllers/book.controller");
const authUser = require("../middlewares/authUser");

const express = require("express");
const router = express.Router();

router.get("/", bookController.listBook);
router.get("/detail/:bookId", authUser, bookController.detailBook);
router.get("/slide/", bookController.getSlideshow);
router.post("/", bookController.createBook);
router.put("/:bookId", bookController.editBook);
router.delete("/delete/:bookId", bookController.deleteBook);
router.get("/bookByTag/:tagId", bookController.getBookbyTag);

module.exports = router;
