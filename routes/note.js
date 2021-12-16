const noteController = require("../controllers/note.controller");

const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

router.get("/", authUser, noteController.getNotesByAccountId);
router.get("/:bookId", authUser, noteController.detailNoteinBook);

router.get(
  "/getNotesActiveByAccountId/",
  authUser,
  noteController.getNotesActiveByAccountId
);

module.exports = router;
