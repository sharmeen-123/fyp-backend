const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const productSchema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  favourites:{
    type: Array
  },
  colors: {
    type: Array
  },
  sizes:{
    type: Array
  },
  images:{
    type: Array
  },
  images3D:{
    type:String
  },
  rating:{
    type: Number,
    default: 0,
  }
});
module.exports = mongoose.model("product", productSchema, "products");
