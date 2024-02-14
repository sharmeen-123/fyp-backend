const express = require("express");
const modelController = require("../controller/model");

const uploadMiddleware = require("../middleware/uploadFile")

const modelRouter = express.Router();

modelRouter.post("/addModel",uploadMiddleware.single('file'), modelController.addModel);
modelRouter.get("/getCustomModel/:company", modelController.getCustomModels);
modelRouter.get("/getDefaultModel", modelController.getdefaultModels);
modelRouter.delete("/deleteModel/:id", modelController.deleteModel);
modelRouter.put("/updateModel/:id",uploadMiddleware.single('file'), modelController.updateModel);
module.exports =  modelRouter;
