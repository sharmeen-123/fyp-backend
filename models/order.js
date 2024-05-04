const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const orderSchema = new Schema({
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
  orderID: {
    type: String,
    required: true,
  },
  cardNo: {
    type: String,
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
      },
      size: {
        type: String,
      },
    },
  ],
  address : {
    type: String,
  },
  city : {
    type: String,
  },
  postalCode : {
    type: String,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "coupon",
  },
  discountedPrice: {
    type: Number,
  },
  WithdrawnAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now()
  }
});
module.exports = mongoose.model("order", orderSchema, "orders");
