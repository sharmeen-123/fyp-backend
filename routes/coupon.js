const express = require("express");
const couponController = require("../controller/coupon");

const couponRouter = express.Router();

couponRouter.post("/addCoupon", couponController.addCoupon);
couponRouter.put("/collectCoupon", couponController.collectCoupon);
couponRouter.put("/availCoupon", couponController.availCoupon);
couponRouter.get("/getCoupon/:company", couponController.getCoupon);
couponRouter.get("/getCouponWithCard/:company", couponController.getCouponWithCard);
couponRouter.get("/getCouponById/:id", couponController.getCouponById);

module.exports =  couponRouter;
