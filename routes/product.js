const express = require("express");
const productController = require("../controller/product");
const uploadMultipleFiles = require('../middleware/uploadMultipleFiles')

const productRouter = express.Router();

productRouter.post("/addProduct", productController.addProduct);
productRouter.get("/getProduct/:category/:company", productController.getProduct);
productRouter.get("/getAllProduct", productController.getAllProducts);
productRouter.get("/getProductById/:product", productController.getProductById);
productRouter.put("/uploadImages/:id",uploadMultipleFiles, productController.uploadImages);
productRouter.put("/uploadImages3D/:id",uploadMultipleFiles, productController.uploadImages3D);
productRouter.put("/updateProduct/:id",uploadMultipleFiles, productController.editProduct);
productRouter.delete("/deleteProduct/:id", productController.deleteProduct);
productRouter.get("/getCompanyTotalProduct/:company", productController.totalCompanyProduct);



module.exports =  productRouter;
