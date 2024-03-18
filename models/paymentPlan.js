const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const paymentPlanSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  radius: {
    type: Number,
    required: true,
  },
  noOfCoupons: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  }
  
});
module.exports = mongoose.model(
  "paymentPlan",
  paymentPlanSchema,
  "paymentPlans"
);


