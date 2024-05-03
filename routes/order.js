const express = require("express");
const orderController = require("../controller/order");

const orderRouter = express.Router();

orderRouter.post("/OrderItem", orderController.addOrder);
orderRouter.get("/checkValidCoupon/:user/:coupon", orderController.checkValidCoupon);
orderRouter.get("/getOrder/:user", orderController.getOrder);
orderRouter.get("/getCompanyOrder/:company", orderController.getCompanyOrder);

module.exports =  orderRouter;
