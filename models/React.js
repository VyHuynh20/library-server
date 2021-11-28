const mongoose = require("mongoose");

const ReactSchema = mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Account",
    },

    object: {
        type: String, // Book - Comment - Reply
    },

    type: {
        type: Number,
        enum: [1, 0], // Like - Dislike
        default: 1,
    },
});

// createdAt + updatedAt
ReactSchema.set("timestamps", true);

module.exports = mongoose.model("Account", ReactSchema);
