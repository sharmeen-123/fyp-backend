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
 
  default: {
    type: Boolean,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  deleted: {
    default: false
  }
});
module.exports =  mongoose.model("model", modelSchema, "models");
