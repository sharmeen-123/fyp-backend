const express = require("express");
const walletController = require("../controller/wallet");


const walletRouter = express.Router();

walletRouter.get("/getWallet/:user", walletController.getWallet);

module.exports =  walletRouter;
