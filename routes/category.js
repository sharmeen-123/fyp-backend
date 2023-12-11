const express = require("express");
const categoryController = require("../controller/category");

const categoryRouter = express.Router();

categoryRouter.post("/addCategory", categoryController.addCategory);
categoryRouter.get("/getCategory", categoryController.getCategory);


module.exports =  categoryRouter;
