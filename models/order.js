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
  totalAmount: {
    type: Number,
    required: true,
  }
});
module.exports = mongoose.model("order", orderSchema, "orders");
