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
    note: { type: String },
    noteNoSign: { type: String },

    page: { type: Number },
    status: {
        type: Number,
        enum: [0, 1, 2], // deleted - active - edited
        default: 1,
    },
});

NoteSchema.set("timestamps", true);

module.exports = mongoose.model("Note", NoteSchema);
