const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const AccountSchema = mongoose.Schema({
    nickname: {
        type: String,
        trim: true,
        default: "",
    },
    password: { type: String },
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phoneNumber: { type: String, minLength: 10, maxLength: 11, default: "" },

    avatar: { type: String, default: "" },
    avatarGoogle: { type: String, default: "" },

    faculty: { type: String, default: "FIT" },

    dob: { type: Date, default: Date.now() },
    gender: { type: String, default: "male" },
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
AccountSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Account", AccountSchema);
