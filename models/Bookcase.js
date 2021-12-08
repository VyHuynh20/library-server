const mongoose = require("mongoose");
const BookcaseSchema = mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Account",
    },
    name: {
        type: String,
    },
    book: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Book",
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
    background: {
        type: String,
    },
    currentPage: {
        type: Number,
    },
});

BookcaseSchema.set("timestamps", true);

module.exports = mongoose.model("Bookcase", BookcaseSchema);
