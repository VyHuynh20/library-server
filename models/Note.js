const mongoose = require("mongoose");
const NoteSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Account",
  },
  book: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Book",
  },
  name: { type: String, default: "" },
  content: { type: String, default: "" },
  contentNoSign: { type: String, default: "" },
  nameNoSign: { type: String, default: "" },
  image: { type: String, default: "" },

  page: { type: Number, default: 1 },
  status: {
    type: Number,
    enum: [0, 1, 2], // delete - open - close
    default: 2,
  },
});

NoteSchema.set("timestamps", true);

module.exports = mongoose.model("Note", NoteSchema);
