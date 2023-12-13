const express = require("express");
const categoryController = require("../getAbsolutePath");

const categoryRouter = express.Router();

categoryRouter.get("/path/:image", categoryController.addFindPath);


module.exports =  categoryRouter;
