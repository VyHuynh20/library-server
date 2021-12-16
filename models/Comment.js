const mongoose = require("mongoose");
const CommentSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Account",
  },
  book: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Book",
  },
  content: { type: String, default: "" },
  totalLike: { type: Number, default: 0 },
  totalDislike: { type: Number, default: 0 },
  liked: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Account",
    },
  ],
  disliked: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Account",
    },
  ],

  replies: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Reply",
    },
  ],

  status: {
    type: Number,
    enum: [0, 1, 2], // deleted - active - edited
    default: 1,
  },

  type: {
    type: Number,
    enum: [0, 1, -1], // unset - positive - negative
    default: 1,
  },
});

CommentSchema.set("timestamps", true);

module.exports = mongoose.model("Comment", CommentSchema);
