const replyController = require("../controllers/reply.controller");
const express = require("express");
const authUser = require("../middlewares/authUser");
const router = express.Router();

//NOTE: get replies by commentId
router.get(
  "/getRepliesByCommentId/:commentId",
  replyController.getRepliesByCommentId
);

//NOTE: get reply
router.get("/:_id", replyController.getReply);

//NOTE: post new reply
router.post("/", authUser, replyController.postReply);

//NOTE: delete new reply
router.delete("/:_id", authUser, replyController.deleteReply);

//NOTE: post react
router.post("/reacts/:_id", authUser, replyController.postReact);

module.exports = router;
