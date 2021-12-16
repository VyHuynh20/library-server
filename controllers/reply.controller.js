const Comment = require("../models/Comment");
const Account = require("../models/Account");
const Reply = require("../models/Reply");
const { checkUser } = require("../handlers/authorization");
const moment = require("moment");

exports.getReply = async function (req, res) {
  try {
    const _id = req.params._id;
    let reply = await Reply.findById(_id)
      .select(
        "_id commentId content createdAt user totalLike totalDislike liked disliked"
      )
      .populate("user", ["_id", "avatar", "name", "hoa", "email", "nickname"]);
    if (reply) {
      let account = await checkUser(req);
      //NOTE: parse date create
      reply._doc.createdAt = moment(reply._doc.createdAt).format(
        "DD/MM/YYYY HH:mm"
      );

      //NOTE: check react of user
      let react = 0;
      if (account) {
        if (reply.liked && reply.liked.includes(account._id)) {
          react = 1;
        }
        if (reply.disliked && reply.disliked.includes(account._id)) {
          react = 2;
        }
      }
      reply._doc["react"] = react;

      return res.status(200).json(reply);
    }
    return res.status(404).json({ error: "Not found" });
  } catch (e) {
    console.log({ e });
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.getRepliesByCommentId = async function (req, res) {
  const commentId = req.params.commentId;
  let replies = await Reply.find({ commentId: commentId })
    .populate({
      path: "user",
      select: "_id nickname name email",
    })
    .select("_id user content commentId totalLike totalDislike liked disliked")
    .sort("-createdAt");

  let account;
  try {
    account = await checkUser(req);
    for (let reply of replies) {
      //NOTE: parse day create
      reply._doc.createdAt = moment(reply._doc.createdAt).format(
        "DD/MM/YYYY HH:mm"
      );
      //NOTE: check react of user
      let react = 0;
      if (account) {
        if (reply.liked && reply.liked.includes(account._id)) {
          react = 1;
        }
        if (reply.disliked && reply.disliked.includes(account._id)) {
          react = 2;
        }
      }
      reply._doc["react"] = react;
    }
    return res.status(200).json(replies);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.postReply = async function (req, res) {
  console.log(">>> post reply");
  try {
    const { commentId, content } = req.body;
    const user = res.locals.account;
    let newReply = new Reply({
      user: user._id,
      commentId: commentId,
      content: content,
    });
    await newReply.save();
    let comment = await Comment.findById(commentId);
    comment.replies.push(newReply._id);
    comment.save();
    return res.status(200).json(newReply);
  } catch (e) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.deleteReply = async function (req, res) {
  try {
    const _id = req.params._id;
    const user = res.locals.account;
    let reply = await Reply.deleteOne({ _id: _id, user: user._id });
    return res.status(200).json(reply);
  } catch (e) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.postReact = async function (req, res) {
  try {
    const { react } = req.body;
    const _id = req.params._id;
    const user = res.locals.account;
    let reply = await Reply.findById(_id);
    console.log({ before: reply._doc });
    if (reply) {
      //NOTE: delete in liked list
      let index = reply._doc.liked.indexOf(user._id);
      if (index > -1) {
        reply._doc.liked.splice(index, 1);
      }

      //NOTE: delete in disliked list
      index = reply._doc.disliked.indexOf(user._id);
      if (index > -1) {
        reply._doc.disliked.splice(index, 1);
      }

      //NOTE: modify react
      switch (react) {
        case 1:
          reply.liked.push(user._id);
          break;
        case -1:
          reply.disliked.push(user._id);
          break;
      }

      //NOTE: calculate total like and dislike
      reply.totalLike = reply.liked.length;
      reply.totalDislike = reply.disliked.length;

      reply.save();

      console.log({ after: reply._doc });

      return res.status(200).json(reply);
    }
    return res.status(400).json({ message: "Not Found" });
  } catch (e) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};
