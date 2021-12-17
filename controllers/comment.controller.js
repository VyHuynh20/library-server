const Comment = require("../models/Comment");
const Account = require("../models/Account");
const { checkUser } = require("../handlers/authorization");
const moment = require("moment");

exports.getComment = async function (req, res) {
  try {
    const _id = req.params._id;
    let comment = await Comment.findById(_id)
      .select(
        "_id book content createdAt user totalLike totalDislike liked disliked replies type"
      )
      .populate("user", ["_id", "avatar", "name", "hoa", "email", "nickname"]);
    if (comment) {
      let account = await checkUser(req);
      //NOTE: parse date create
      comment._doc.createdAt = moment(comment._doc.createdAt).format(
        "DD/MM/YYYY HH:mm"
      );
      //NOTE: get info of auth user
      let authUser = await Account.findById(comment.user._id);
      if (authUser) {
        comment.user._doc["totalBooks"] = authUser.listBooks.length;
        comment.user._doc["isRead"] =
          authUser._doc.listBooks.filter((e) => e._id.toString() === bookId)
            .length > 0;
      }

      //NOTE: check react of user
      let react = 0;
      if (account) {
        if (comment.liked && comment.liked.includes(account._id)) {
          react = 1;
        }
        if (comment.disliked && comment.disliked.includes(account._id)) {
          react = 2;
        }
      }
      comment._doc["react"] = react;

      return res.status(200).json(comment);
    }
    return res.status(404).json({ error: "Not found" });
  } catch (e) {
    console.log({ e });
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

const getCommentUtils = async function (_id) {
  try {
    let comment = await Comment.findById(_id)
      .select(
        "_id book content createdAt user totalLike totalDislike liked disliked replies type"
      )
      .populate("user", ["_id", "avatar", "name", "hoa", "email"]);
    if (comment) {
      let account = await checkUser(req);
      //NOTE: parse date create
      comment._doc.createdAt = moment(comment._doc.createdAt).format(
        "DD/MM/YYYY HH:mm"
      );
      //NOTE: get info of auth user
      let authUser = await Account.findById(comment.user._id);
      if (authUser) {
        comment.user._doc["totalBooks"] = authUser.listBooks.length;
        comment.user._doc["isRead"] =
          authUser._doc.listBooks.filter((e) => e._id.toString() === bookId)
            .length > 0;
      }

      //NOTE: check react of user
      let react = 0;
      if (account) {
        if (comment.liked && comment.liked.includes(account._id)) {
          react = 1;
        }
        if (comment.disliked && comment.disliked.includes(account._id)) {
          react = 2;
        }
      }
      comment._doc["react"] = react;

      return comment;
    }
    return;
  } catch (e) {
    return;
  }
};

exports.getCommentsByBookId = async function (req, res) {
  const bookId = req.params.bookId;
  let comments = await Comment.find({ book: bookId }, [
    "_id",
    "book",
    "content",
    "createdAt",
    "user",
    "totalLike",
    "totalDislike",
    "liked",
    "disliked",
    "replies",
    "type",
  ])
    .populate("user", ["_id", "avatar", "name", "hoa", "email", "nickname"])
    .sort("-createdAt");

  let account;
  try {
    account = await checkUser(req);
    for (let comment of comments) {
      //NOTE: parse date create
      comment._doc.createdAt = moment(comment._doc.createdAt).format(
        "DD/MM/YYYY HH:mm"
      );
      //NOTE: get info of auth user
      let authUser = await Account.findById(comment.user._id);
      if (authUser) {
        comment.user._doc["totalBooks"] = authUser.listBooks.length;
        comment.user._doc["isRead"] =
          authUser._doc.listBooks.filter((e) => e._id.toString() === bookId)
            .length > 0;
      }

      //NOTE: check react of user
      let react = 0;
      if (account) {
        if (comment.liked && comment.liked.includes(account._id)) {
          react = 1;
        }
        if (comment.disliked && comment.disliked.includes(account._id)) {
          react = -1;
        }
      }
      comment._doc["react"] = react;
    }
    return res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.postComment = async function (req, res) {
  console.log(">>> post new comment");
  try {
    const { book, content, type } = req.body;
    const user = res.locals.account;
    let newComment = new Comment({
      user: user._id,
      book: book,
      content: content,
      type: type,
    });
    await newComment.save();
    return res.status(200).json(newComment);
  } catch (e) {
    console.log({ e });
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.deleteComment = async function (req, res) {
  try {
    const _id = req.params._id;
    const user = res.locals.account;
    let comment = await Comment.deleteOne({ _id: _id, user: user._id });
    return res.status(200).json(comment);
  } catch (e) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};

exports.postReact = async function (req, res) {
  try {
    const { react } = req.body;
    const _id = req.params._id;
    const user = res.locals.account;
    let comment = await Comment.findById(_id);
    console.log({ before: comment._doc });
    if (comment) {
      //NOTE: delete in liked list
      let index = comment._doc.liked.indexOf(user._id);
      if (index > -1) {
        comment._doc.liked.splice(index, 1);
      }

      //NOTE: delete in disliked list
      index = comment._doc.disliked.indexOf(user._id);
      if (index > -1) {
        comment._doc.disliked.splice(index, 1);
      }

      //NOTE: modify react
      switch (react) {
        case 1:
          comment.liked.push(user._id);
          break;
        case -1:
          comment.disliked.push(user._id);
          break;
      }

      //NOTE: calculate total like and dislike
      comment.totalLike = comment.liked.length;
      comment.totalDislike = comment.disliked.length;

      comment.save();

      console.log({ after: comment._doc });

      return res.status(200).json(comment);
    }
    return res.status(400).json({ message: "Not Found" });
  } catch (e) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
};
