const mongoose = require("mongoose");
const MusicSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    namenosign: {
        type: String,
    },

    link: { type: String, required: true },
    description: { type: String, default: "Unknown" },
    price: { type: Number, default: 0 },
    is_active: {
        type: Number,
        required: true,
        enum: [0, 1],
        default: 1,
    },
});

MusicSchema.set("timestamps", true);

module.exports = mongoose.model("Music", MusicSchema);
