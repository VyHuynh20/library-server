const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        trim: true,
    },
    password: { type: String },
    fullName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phoneNumber: { type: String, minLength: 10, maxLength: 11 },

    avt: { type: String },
    avtGoogle: { type: String },

    faculty: { type: String },

    dob: { type: Date },
    gender: { type: String },
    point: { type: Number, default: 0 },

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
