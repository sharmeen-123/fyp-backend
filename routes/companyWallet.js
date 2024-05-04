const express = require("express");
const companyWalletController = require("../controller/CompanyWallet");

const companyWalletRouter = express.Router();

companyWalletRouter.post("/withdraw", companyWalletController.withdraw);
companyWalletRouter.get("/getWallet/:company", companyWalletController.getCompanyWallet);


module.exports =  companyWalletRouter;
