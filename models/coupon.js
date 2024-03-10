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
  locations: [
    {
      longitude: {
        type: String,
        required: true,
      },
      latitude: {
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
  area: {
    type: String,
    required: true,
  },
  radius: {
    type: Number,
    required: true,
  },
  distributedCoupons: {
    type: Number,
    required: true,
  },
  availed: {
    type: Number,
    default: 0,
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
