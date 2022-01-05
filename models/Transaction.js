const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const TransactionSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Account",
    required: true,
  },
  before: { type: Number, default: 0, required: true },
  after: { type: Number, default: 0, required: true },
  hoa: { type: Number, default: 0, required: true },
  type: { type: String, default: "", required: true },
  message: { type: String, default: "" },
  status: {
    type: Number,
    required: true,
    enum: [1, 0], //1-success, 0-fail
    default: 1,
  },
});

// createdAt + updatedAt
TransactionSchema.set("timestamps", true);
TransactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Transaction", TransactionSchema);
