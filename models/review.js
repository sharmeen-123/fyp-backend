const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  review: {
    type: String,
  },
  photos: [
    {
      type: String,
    },
  ],
});
module.exports = mongoose.model("review", reviewSchema, "reviews");
