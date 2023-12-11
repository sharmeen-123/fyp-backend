const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const cartSchema = new Schema({
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
});
module.exports =  mongoose.model("cart", cartSchema, "carts");
