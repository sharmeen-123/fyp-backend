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
    type: Array
  }
});
module.exports = mongoose.model("product", productSchema, "products");
