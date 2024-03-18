const express = require("express");
const paymentMethodController = require("../controller/paymentMethod");

const paymentMethodRouter = express.Router();

paymentMethodRouter.post("/addPaymentMethod", paymentMethodController.addPaymentMethod);
paymentMethodRouter.get("/getPaymentMethod/:user", paymentMethodController.getPaymentMethod);
paymentMethodRouter.delete("/deletePaymentMethod/:id", paymentMethodController.deletePaymentMethod);
paymentMethodRouter.put("/setDefault/:id/:company", paymentMethodController.setDefault);

module.exports =  paymentMethodRouter;
