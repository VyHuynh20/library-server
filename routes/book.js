const bookController = require("../controllers/book.controller");
const authUser = require("../middlewares/authUser");

const express = require("express");
const router = express.Router();

router.get("/", bookController.listBook);
router.get("/detail/:bookId", bookController.detailBook);
router.get("/slide/", bookController.getSlideshow);
router.post("/", bookController.createBook);
router.put("/:bookId", bookController.editBook);
router.delete("/delete/:bookId", bookController.deleteBook);
router.get("/bookByTag/:tagId", bookController.getBookbyTag);

router.get("/getComment/:bookId", bookController.getComment);

router.post("/search/:bookId", bookController.search);

module.exports = router;
