const mongoose = require("mongoose");
const CardSchema = mongoose.Schema({
    flaskcard: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Flaskcard",
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    status: {
        type: Number,
        enum: [0, 1, 2], // deleted - active - edited
        default: 1,
    },
});

CardSchema.set("timestamps", true);

module.exports = mongoose.model("Card", CardSchema);
