const adminController = require("../controllers/admin.controller");
const express = require("express");
const authAdmin = require("../middlewares/authAdmin");
const router = express.Router();

// Log in Google: /accounts/login-google
router.post("/login", adminController.login);
router.get("/logout", authAdmin, adminController.logout);
router.get("/resign", authAdmin, adminController.reSign);

//NOTE: Book manage
router.get("/getAllBooks", authAdmin, adminController.getAllBooks);
router.get("/getBookDetail/:bookId", authAdmin, adminController.getBookDetail);
router.put("/putBook/:bookId", authAdmin, adminController.putBook);
router.put("/banBook/:bookId", authAdmin, adminController.banBook);
router.delete("/deleteBook/:bookId", authAdmin, adminController.deleteBook);

//NOTE: Tag manage
router.get("/getAllTags", authAdmin, adminController.getTags);
router.get("/getTagDetail/:tagId", adminController.getTagDetail);
router.put("/putTag/:tagId", adminController.editTag);
router.put("/banTag/:tagId", authAdmin, adminController.banTag);
router.delete("/deleteTag/:tagId", authAdmin, adminController.deleteTag);

//NOTE: Category manage
router.get("/getCategoryDetail/:categoryId", adminController.getCategoryDetail);
router.put("/putCategory/:categoryId", authAdmin, adminController.editCategory);
router.put("/banCategory/:categoryId", authAdmin, adminController.banCategory);
router.delete(
  "/deleteCategory/:categoryId",
  authAdmin,
  adminController.deleteCategory
);

//NOTE: User manage
router.get("/getAllUser", authAdmin, adminController.getAllUsers);
router.get("/getUserDetail/:userId", authAdmin, adminController.getUserDetail);
router.put("/banUser/:userId", authAdmin, adminController.banUser);

//NOTE: Category manage
router.get("/getAllCategories", authAdmin, adminController.getAllCategories);
router.get(
  "/getCategoryDetail/:categoryId",
  authAdmin,
  adminController.getCategoryDetail
);
router.post("/createCategory", authAdmin, adminController.createCategory);
router.put(
  "/editCategory/:categoryId",
  authAdmin,
  adminController.editCategory
);
router.put("/banCategory/:categoryId", authAdmin, adminController.banCategory);

//NOTE: Tag manage
router.get("/getAllTagsManage", authAdmin, adminController.getAllTags);
router.get("/getTagDetail", authAdmin, adminController.getTagDetail);
router.post("/createTag", authAdmin, adminController.createTag);
router.put("/editTag/:tagId", authAdmin, adminController.editTag);
router.put("/banTag/:tagId", authAdmin, adminController.banTag);

//NOTE: report
router.get("/bookStatistical", adminController.bookStatistical);
router.get("/topBooks", adminController.topBooks);
router.get("/booksByTags", adminController.booksByTags);
router.get("/hoaByMonth", adminController.hoaByMonth);
router.get("/userStatistical", adminController.userStatistical);
router.get("/userByFaculty", adminController.userByFaculty);
router.get("/userByMonth", adminController.userByMonth);

module.exports = router;
