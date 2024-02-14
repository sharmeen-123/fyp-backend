const express = require("express");
const reviewController = require("../controller/review");
const uploadMultipleFiles = require('../middleware/uploadMultipleFiles')


const reviewRouter = express.Router();

reviewRouter.post("/addReview", reviewController.addReview);
reviewRouter.put("/addImages",uploadMultipleFiles, reviewController.uploadImages);
reviewRouter.get("/getReview", reviewController.getReview);

module.exports =  reviewRouter;
