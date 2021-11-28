const mongoose = require("mongoose");

const ReplySchema = mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Account",
        required: true,
        trim: true,
    },

    comment: {
        type: String,
        required: true,
    },

    comment_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Comment",
    },
    status: {
        type: Number,
        enum: [0, 1, 2], // deleted - active - edited
        default: 1,
    },
});

ReplySchema.set("timestamps", true);
module.exports = mongoose.model("Reply", ReplySchema);
