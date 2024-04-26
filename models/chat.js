const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const chatSchema = new Schema({
 sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  message: {
    type: 'String',
    required: true
  },
  date: {
    type: Date,
    default: Date.now  
  }
});
module.exports =  mongoose.model("chat", chatSchema, "chats");
