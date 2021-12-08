const mongoose = require("mongoose");
const TagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: { type: String },
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Category",
    },
    is_active: {
        type: Number,
        required: true,
        enum: [0, 1],
        default: 1,
    },
});

TagSchema.set("timestamps", true);

module.exports = mongoose.model("Tag", TagSchema);
