const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const walletSchema = new Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "coupon",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  collectedAt: {
    type: Date,
    required: true,
  },
  availed: {
    type: Boolean,
    default: false
  }
});
module.exports =  mongoose.model("wallet", walletSchema, "wallets");
