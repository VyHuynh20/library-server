const commentController = require("../controllers/comment.controller");
const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

//NOTE: get comments by bookId
router.get(
  "/getCommentsByBookId/:bookId",
  commentController.getCommentsByBookId
);

//NOTE: get comment by _id
router.get("/:_id", commentController.getComment);

//NOTE: post new comment
router.post("/", authUser, commentController.postComment);

//NOTE: delete new comment
router.delete("/:_id", authUser, commentController.deleteComment);

//NOTE: post react
router.post("/reacts/:_id", authUser, commentController.postReact);

module.exports = router;
