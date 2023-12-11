const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  cashPayment: {
    type: Boolean,
    required: true,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "coupon",
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paymentMethod",
  },
});
module.exports = mongoose.order("order", orderSchema, "orders");
