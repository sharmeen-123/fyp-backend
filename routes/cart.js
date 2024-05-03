const express = require("express");
const cartController = require("../controller/cart");

const cartRouter = express.Router();

cartRouter.post("/addToCart", cartController.addtoCart);
cartRouter.get("/getCart/:user", cartController.getCart);
cartRouter.delete("/clearCart", cartController.clearCart);
cartRouter.put("/removeFromCart", cartController.removeFromCart);
cartRouter.put("/updateAddress", cartController.updateAddress);

module.exports =  cartRouter;
