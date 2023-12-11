const express = require("express");
const userController = require("../controller/user");
const uploadMiddleware = require("../middleware/uploadFile")
const uploadMultipleFiles = require('../middleware/uploadMultipleFiles')

const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.put("/addCompanyName/:id", userController.addCompanyName);
userRouter.put("/uploadImage/:id",uploadMiddleware.single('file'), userController.uploadImage);
userRouter.put("/completeProfile/:id", userController.completeProfile);
userRouter.put("/setCompanyType/:id", userController.setCompanyType);
userRouter.put("/uploadDocuments/:id",uploadMultipleFiles, userController.uploadDocuments);
userRouter.put("/sendOtp", userController.sendOTP);
userRouter.put("/verifyOtp", userController.verifyOtp);
userRouter.put("/resetPassword", userController.resetPassword);
userRouter.put("/verifyCompany", userController.verifyCompany);
userRouter.get("/login", userController.login);

module.exports =  userRouter;
