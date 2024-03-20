const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const couponSchema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "model",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },

  discount: {
    type: Number,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  lng:{
    type: Number,
    required: true
  },
  lat:{
    type: Number,
    required: true
  },
  locations: [
    {
      lat: {
        type: String,
        required: true,
      },
      lng: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      collected: {
        type: Boolean,
        default: false,
      },
    },
  ],
  radius: {
    type: Number,
    required: true,
  },
  distributedCoupons: {
    type: Number,
    required: true,
  },
  location:{
    type: String,
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paymentMethod",
    required: true
  },
  InvoiceID: {
    type: String,
  },
  availed: {
    type: Number,
    default: 0,
  },
  amount:{
    type: Number,
    required: true,
  },
  collected: {
    type: Number,
    default: 0,
  },
  unCollected: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("coupon", couponSchema, "coupons");
