const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const modelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required:true,
  },
});
module.exports =  mongoose.model("model", modelSchema, "models");
