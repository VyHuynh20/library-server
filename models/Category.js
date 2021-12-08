const mongoose = require("mongoose");
const Tag = require("./Tag");
const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    namenosign: {
        type: String,
        trim: true,
    },
    thumbnail: { type: String },
    quote: { type: String },
    color: { type: String },
    is_active: {
        type: Number,
        required: true,
        enum: [0, 1],
        default: 1,
    },
    tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Tag" }],
});

CategorySchema.set("timestamps", true);

module.exports = mongoose.model("Category", CategorySchema);
