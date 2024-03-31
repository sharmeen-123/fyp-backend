const express = require("express");
const dashboardController = require("../controller/dashboard");

const dashboardRouter = express.Router();


dashboardRouter.get("/getCAdminCards", dashboardController.getCoupon);

module.exports =  dashboardRouter;
