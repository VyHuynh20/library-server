const mongoose = require("mongoose");
const MyMusicSchema = mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Account",
    },
    music: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Music",
    },
    is_active: {
        type: Number,
        enum: [0, 1],
        default: 1,
    },
});

MyMusicSchema.set("timestamps", true);

module.exports = mongoose.model("MyMusic", MyMusicSchema);
