const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const couponSchema = new Schema({
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
    model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "model",
    required: true,
  },
  name: [
    {
      type: String,
      required: true,
    },
  ],
  discount: {
    type: Number,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  location: {
    type: Object,
    required: true,
  },
});
module.exports = mongoose.coupon("coupon", couponSchema, "coupons");
