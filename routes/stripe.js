const express = require("express");
const stripeController = require("../controller/stripe");


const stripeRouter = express.Router();

stripeRouter.post("/createPayment", stripeController.createPayment);
// stripeRouter.put("/updatePayment",stripeController.updatePayment);

module.exports =  stripeRouter;
