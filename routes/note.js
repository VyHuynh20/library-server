const noteController = require("../controllers/note.controller");

const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

router.get("/", authUser, noteController.getNotesByAccountId);
router.get("/getDetail/:_id", authUser, noteController.getNoteDetail);
router.get(
  "/getNotesActive/",
  authUser,
  noteController.getNotesActiveByAccountId
);
//NOTE: post new note by book in bookcase
router.post("/", authUser, noteController.postNewNote);
//NOTE: modify note
router.put("/", authUser, noteController.putNote);
//NOTE: change content
router.put("/content", authUser, noteController.putNoteContent);
//NOTE: change page
router.put("/page", authUser, noteController.putNoteNumberPage);
//NOTE: delete note
router.delete("/:_id", authUser, noteController.deleteNote);
//NOTE: change note info
router.put("/changeInfo/", authUser, noteController.changeNoteInfo);
//NOTE: close note
router.get("/close/:_id", authUser, noteController.closeNote);

module.exports = router;
