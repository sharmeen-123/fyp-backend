const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetToken: {
    // unselect
    type: String,
  },
  passwordResetExpires: {
    // unselect
    type: Date,
  },
  otp: {
    type: String,
  },
  otp_expiry_time: {
    type: Date,
  },
  type: {
    type: String,
    required: true
  },
  location: {
    type: String,
  },
  companyType: {
    type: String
  },
  categoryTags: {
    type: Array
  },
  documents:{
    type: Array
  },
  contact: {
    type: Number,
  },
  image: {
    type: String,
  },
  verified:{
    type:Boolean,
    required:true,
  }
});
module.exports =  mongoose.model("user", userSchema, "users");
