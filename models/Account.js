const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema({
    nickname: {
        type: String,
        trim: true,
    },
    password: { type: String },
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phoneNumber: { type: String, minLength: 10, maxLength: 11 },

    avatar: { type: String },
    avatarGoogle: { type: String },

    faculty: { type: String },

    dob: { type: Date },
    gender: { type: String },
    hoa: { type: Number, default: 0 },

    role: { type: String, default: "User" },
    is_banned: {
        type: Number,
        required: true,
        enum: [1, 0],
        default: 0,
    },
});

// createdAt + updatedAt
AccountSchema.set("timestamps", true);

module.exports = mongoose.model("Account", AccountSchema);
