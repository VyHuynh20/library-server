const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const BookSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  nameNoSign: {
    type: String,
  },

  author: { type: String },
  authorNoSign: { type: String },

  tags: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Tag",
    },
  ],

  description: { type: String, default: "" },
  descriptionNoSign: { type: String, default: "" },
  image: { type: String, default: "" },
  is_active: {
    type: Number,
    required: true,
    enum: [0, 1],
    default: 1,
  },

  quote: [{ type: String, default: "" }],
  price: { type: Number, default: 0 },

  link: { type: String, default: "" },
  linkIntro: { type: String, default: "" },
  key: {
    type: String,
    default: "",
  },
  totalPages: { type: Number, default: 0 },

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
  totalRead: { type: Number, default: 0 },
});

BookSchema.set("timestamps", true);
BookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Book", BookSchema);
