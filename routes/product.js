const express = require("express");
const productController = require("../controller/product");
const uploadMultipleFiles = require('../middleware/uploadMultipleFiles')
const uploadModelMiddleware = require("../middleware/modelMiddleware")

const productRouter = express.Router();

productRouter.post("/addProduct", productController.addProduct);
productRouter.get("/getProduct/:category/:company", productController.getProduct);
// productRouter.get("/getAllCompanyProduct/:company", productController.getAllCompanyProduct);

productRouter.get("/getAllProduct", productController.getAllProducts);
productRouter.get("/getProductById/:product", productController.getProductById);
productRouter.put("/uploadImages/:id",uploadMultipleFiles, productController.uploadImages);

productRouter.put("/addRemoveFavourite/:id",productController.addRemoveFavourite);
productRouter.put("/updateProduct/:id",uploadMultipleFiles, productController.editProduct);
productRouter.delete("/deleteProduct/:id", productController.deleteProduct);
productRouter.get("/getCompanyTotalProduct/:company", productController.totalCompanyProduct);
productRouter.get("/getProductsWithDiscount", productController.getDiscountProduct);
productRouter.get("/getFavouriteProducts/:user", productController.getFavouriteProducrs);

productRouter.put("/uploadImages3D/:id", (req, res, next) => {
  const currentDate = new Date();
  const folder = currentDate.toISOString().replace(/:/g, "-")
  req.folder= folder; // Attach the userId to the request object
  next(); // Call next to proceed to the multer middleware
}, 
 uploadModelMiddleware, productController.uploadImages3D);



module.exports =  productRouter;
