const Cart = require("../models/cart");

const CartController = {
  // addCart api
  async addtoCart(req, res) {
    let { user, product } = req.body;
    let CartData = { user, products: [{ product, quantity: 1 }] };
    // Find if the Cart already exists
    const cartExists = await Cart.findOne({
      user,
    });

    // update product if cart exists
    if (!cartExists) {
      let cart = new Cart(CartData);

      // Save the Cart to the database
      cart.save((error, addNewCart) => {
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }
        res.status(200).send({
          success: true,
          message: "new cart added successfully",
          _id: addNewCart._id,
        });
      });
    } else {
      let products = cartExists.products;
      let updatedProducts = [];
      let index = -1;

      // increasing quantity of product exists in cart
      products.map((val, ind) => {
        let newPro = val;
        if (newPro.product == product) {
          newPro.quantity = newPro.quantity + 1;
          index = ind;
        }
        updatedProducts.push(newPro);
      });
      if (index == -1) {
        // push in cart if product not found in cart
        updatedProducts.push({
          product,
          quantity: 1,
        });
      }

      try {
        // update database
        const updatedCart = await Cart.findOneAndUpdate(
          { user },
          { products: updatedProducts }, // Use $each to push multiple items
          { new: true }
        );

        if (updatedCart) {
          return res.status(200).send({
            success: true,
            message: "Cart updated successfully",
            cart: updatedCart,
          });
        } else {
          return res.status(404).send({
            success: false,
            error: "Cart not found",
          });
        }
      } catch (err) {
        return res.status(500).send({
          success: false,
          error: "Some Error Occurred",
        });
      }
    }
  },
  // ..................... remove item from cart ...............................
  async removeFromCart(req, res) {
    let { user, product } = req.body;

    // Find if the Cart already exists
    const cartExists = await Cart.findOne({
      user,
    });

    if (cartExists) {
      let products = cartExists.products;
      const index = products.findIndex(element => element.product == product);
      if(index != -1){
        if(products[index].quantity === 1){
            products.splice(index,index+1);
        }
        else{
            products[index].quantity = products[index].quantity - 1
        }
      }
      
      try {
        const updatedCart = await Cart.findOneAndUpdate(
          { user },
          { products }, // Use $each to push multiple items
          { new: true }
        );

        if (updatedCart) {
          return res.status(200).send({
            success: true,
            message: "Cart updated successfully",
            cart: updatedCart,
          });
        } else {
          return res.status(404).send({
            success: false,
            error: "Cart not found",
          });
        }
      } catch (err) {
        return res.status(500).send({
          success: false,
          error: "Some Error Occurred",
        });
      }
    } else {
      // Save the Cart to the database

      return res.status(400).send({
        success: false,
        error: "cart not found",
      });
    }
  },

  // .......................................get Cart api.........................................
  async getCart(req, res) {
    let { user } = req.body;

    // Find if the Cart already exists
    const CartExists = await Cart.find({
      user,
    });

    if (CartExists.length > 0) {
      return res.status(200).send({
        success: true,
        message: "Cart Found",
        data: CartExists,
      });
    } else {
      return res.status(400).send({
        success: false,
        error: "Cart with this id do not exists",
      });
    }
  },

  // .........................................clear Cart api.............................
  async clearCart(req, res) {
    let { user } = req.body;

    const CartDeleted = await Cart.findOneAndDelete({
      user,
    });

    if (CartDeleted) {
      return res.status(200).send({
        success: true,
        message: "Cart Deleted Successfully",
        // data: productExists,
      });
    } else {
      return res.status(400).send({
        success: false,
        error: "Unable to delete cart",
      });
    }
  },
};

module.exports = CartController;
