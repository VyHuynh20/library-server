const bookController = require("../controllers/book.controller");
const authorization = require("../handlers/authorization");

const express = require("express");
const router = express.Router();

router.get("/", bookController.listBook);
router.get(
    "/detail/:bookId",
    authorization.authUser,
    bookController.detailBook
);
router.post("/", bookController.createBook);
router.put("/:bookId", bookController.editBook);
router.delete("/delete/:bookId", bookController.deleteBook);
router.get("/:tagName", bookController.getBookbyTag);

router.get("/slide", bookController.getSlideshow);

module.exports = router;
