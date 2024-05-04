const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const companyWalletSchema = new Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  orderID: {
    type: String,
  },
  cardNo: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  amount: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model(
  "companyWallet",
  companyWalletSchema,
  "companyWallets"
);
