const express = require("express");
const paymentPlanController = require("../controller/paymentPlan");

const paymentPlanRouter = express.Router();

paymentPlanRouter.post("/addPaymentPlan", paymentPlanController.addPaymentPlan);
paymentPlanRouter.get("/getPaymentPlan", paymentPlanController.getPaymentPlan);
paymentPlanRouter.delete("/deletePaymentPlan/:id", paymentPlanController.deletePaymentPlan);
paymentPlanRouter.put("/updatePaymentPlan/:id", paymentPlanController.editPaymentPlan);

module.exports =  paymentPlanRouter;
