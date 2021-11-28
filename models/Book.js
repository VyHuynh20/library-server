const mongoose = require("mongoose");
const BookSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    namenosign: {
        type: String,
    },
    authors: [{ type: String }],
    tags: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Tag",
        },
    ],

    description: { type: String },
    image: { type: String },
    is_active: {
        type: Number,
        required: true,
        enum: [0, 1],
        default: 1,
    },

    quote: [{ type: String, required: true }],

    link: { type: String, required: true },
    linkIntro: { type: String, required: true },

    totalLike: { type: Number, default: 0 },
    totalDislike: { type: Number, default: 0 },
    totalRead: { type: Number, default: 0 },
});

BookSchema.set("timestamps", true);

module.exports = mongoose.model("Book", BookSchema);
