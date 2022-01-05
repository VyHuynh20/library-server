const mongoose = require("mongoose");
const BookcaseSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Account",
  },
  book: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Book",
  },
  key: {
    type: String,
    default: "",
  },
  progress: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    enum: [0, 1, 2], // new - in progress - done
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 0,
  },
  isRefunded: {
    type: Number,
    enum: [0, 1], // 0 - is not refunded, 1 - is refunded
    default: 0,
  },
});

BookcaseSchema.set("timestamps", true);

module.exports = mongoose.model("BookInBookcase", BookcaseSchema);
