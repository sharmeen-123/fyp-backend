const express = require("express");
const dashboardController = require("../controller/dashboard");

const dashboardRouter = express.Router();


dashboardRouter.get("/getCAdminCards", dashboardController.getCoupon);
dashboardRouter.get("/getCompanyCards/:company", dashboardController.getTopCards);
dashboardRouter.get("/getCompanyTable/:company", dashboardController.companyCouponTable);
dashboardRouter.get("/getPieChart/:company", dashboardController.companyPieChart);
dashboardRouter.get("/getBarChart/:company", dashboardController.companyBarChart);
dashboardRouter.get("/getAdminBarChart", dashboardController.adminBarChart);

module.exports =  dashboardRouter;
