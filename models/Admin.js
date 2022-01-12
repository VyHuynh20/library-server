const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const AdminSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: "",
  },
  username: { type: String },
  password: { type: String },
  salt: { type: String },
  avatar: { type: String, default: "" },
  status: {
    type: Number,
    required: true,
    enum: [1, 0],
    default: 1,
  },
});

// createdAt + updatedAt
AdminSchema.set("timestamps", true);
AdminSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Admin", AdminSchema);
