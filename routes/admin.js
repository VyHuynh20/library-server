const bookController = require("../controllers/book.controller");
const categoryController = require("../controllers/category.controller");
const tagController = require("../controllers/tag.controller");
const staticController = require("../controllers/statistic.controller");

const express = require("express");
const router = express.Router();

// ADMIN
router.post("/createBook/", bookController.createBook);
router.put("/editBook/:bookId", bookController.editBook);

router.post("/createTag/", tagController.createTag);
router.put("/editTag/:tagId", tagController.editTag);
router.delete("/deleteTag/:tagId", tagController.deleteTag);

router.post("/createCategory/", categoryController.createCategory);
router.put("/editCategory/:categoryId", categoryController.editCategory);
router.delete("/deleteCategory/:categoryId", categoryController.deleteCategory);

router.get("/statics/", staticController.getBookStatics);

module.exports = router;
