const mongoose = require("mongoose");
const FlaskcardSchema = mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Account",
    },
    name: { type: String },
    status: {
        type: Number,
        enum: [0, 1, 2], // deleted - active - edited
        default: 1,
    },
});

FlaskcardSchema.set("timestamps", true);

module.exports = mongoose.model("Flaskcard", FlaskcardSchema);
