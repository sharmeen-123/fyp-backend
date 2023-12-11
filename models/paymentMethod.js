const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const paymentMethodSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  cardType: {
    type: String,
    required: true,
  },
  CardHolder: {
    type: String,
    required: true,
  },
  cardNo: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  cvv: {
    type: Number,
  },
  setDefault: {
    type: Boolean,
    required: true,
  },
});
module.exports = mongoose.model(
  "paymentMethod",
  paymentMethodSchema,
  "paymentMethod"
);
