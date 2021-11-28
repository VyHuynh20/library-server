const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema({
    user_name: {
        type: String,
        unique: true,
        trim: true,
    },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phonenumber: { type: String, minLength: 10, maxLength: 11 },
    avt: { type: String },

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

    refreshToken: {
        type: String,
        minLength: 50,
        maxLength: 50,
        default: null,
    },
});

// createdAt + updatedAt
AccountSchema.set("timestamps", true);

module.exports = mongoose.model("Account", AccountSchema);
