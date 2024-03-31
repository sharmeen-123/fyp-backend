const express = require("express");
const modelController = require("../controller/model");

const uploadMultipleFiles = require("../middleware/modelMiddleware")

const uploadMiddleware = require("../middleware/uploadFile")

const modelRouter = express.Router();

modelRouter.post("/addModel", (req, res, next) => {
    const currentDate = new Date();
    const folder = currentDate.toISOString().replace(/:/g, "-")
    req.folder= folder; // Attach the userId to the request object
    console.log(req.folder, folder)
    next(); // Call next to proceed to the multer middleware
  }, 
   uploadMultipleFiles
  , modelController.addModel);

modelRouter.get("/getCustomModel/:company", modelController.getCustomModels);
modelRouter.get("/getDefaultModel", modelController.getdefaultModels);
modelRouter.delete("/deleteModel/:id", modelController.deleteModel);
// modelRouter.put("/updateModel/:id",uploadMiddleware, modelController.updateModel);
module.exports =  modelRouter;
