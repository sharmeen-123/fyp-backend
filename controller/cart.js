const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models//user");

const CartController = {
  // addCart api

  async addtoCart(req, res) {
    // product   user   color   size
    let data = req.body;
    try {
      const productExists = await Product.findOne({
        _id: data.product,
      });
      const userExists = await User.findOne({
        _id: data.user,
      });
      // Find if the Cart already exists
      const cartExists = await Cart.findOne({
        user: data.user,
      }).populate("user");

      let cartQty;
      if (cartExists) {
        cartQty = cartExists.products.filter(
          (val) => val.product == data.product
        );
      }

      // new Cart

      if (!cartExists && productExists.quantity > 0) {
        // new cart object
        const CartData = {
          user: data.user,
          company: productExists.company,
          products: [
            {
              product: productExists._id,
              quantity: 1,
              color: data.color,
              size: data.size,
            },
          ],
          address: userExists.location,
          totalAmount: productExists.price,
        };

        // save cart to data base
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
            data: {
              _id: addNewCart._id,
            },
          });
        });
      } else if (
        productExists.quantity == 0 ||
        productExists.quantity < cartQty.quantity
      ) {
        // quantity is 0
        return res.status(400).send({
          success: false,
          error: "Out of stock",
        });
      } else {
        // add item to already added cart
        if (cartExists) {
          if (
            cartExists.company.toString() != productExists.company.toString()
          ) {
            console.log(
              "cart exist",
              cartExists.company,
              "prod exist",
              productExists.company
            );
            // if product is of different company
            return res.status(400).send({
              success: false,
              error:
                "Cart already exist. Clear the cart first to add products from different store",
            });
          } else {
            let prods = cartExists.products;
            let updatedProducts = [];
            let index = -1;

            // increasing quantity of product exists in cart
            prods.map((val, ind) => {
              let newPro = val;
              if (newPro.product.toString() == data.product.toString()) {
                if (productExists.quantity > newPro.quantity) {
                  newPro.quantity = newPro.quantity + 1;
                }
                index = ind;
              }
              updatedProducts.push(newPro);
            });
            if (index == -1) {
              // push in cart if product not found in cart
              updatedProducts.push({
                product: productExists._id,
                quantity: 1,
                color: data.color,
                size: data.size,
              });
            }

            try {
              // update database
              const updatedCart = await Cart.findOneAndUpdate(
                { user: data.user },
                {
                  products: updatedProducts,
                  totalAmount: productExists.price + cartExists.totalAmount,
                }, // Use $each to push multiple items
                { new: true }
              );

              if (updatedCart) {
                return res.status(200).send({
                  success: true,
                  message: "Cart updated successfully",
                  data: updatedCart,
                });
              } else {
                return res.status(404).send({
                  success: false,
                  error: "Cart not found",
                });
              }
            } catch (err) {
              return res.status(400).send({
                success: false,
                error: "Some Error Occurred",
              });
            }
          }
        }
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // ..................... update address ...............................
  async updateAddress(req, res) {
    let { user, address, city, postalCode } = req.body;
    try {
      const updatedCart = await Cart.findOneAndUpdate(
        { user },
        { address, city, postalCode }, // Use $each to push multiple items
        { new: true }
      );

      return res.status(200).send({
        success: true,
        data: updatedCart,
      });
    } catch (error) {
      return res.status(400).send({
        success: false,
        data: "Some error occured",
      });
    }
  },

  // ..................... remove item from cart ...............................
  async removeFromCart(req, res) {
    let { user, product } = req.body;

    // Find if the Cart already exists
    const cartExists = await Cart.findOne({
      user,
    });
    const productExists = await Product.findOne({
      _id: product,
    });

    const totalAmount = cartExists.totalAmount - productExists.price;
    console.log("amount is", totalAmount)

    if (cartExists) {
      let products = cartExists.products;
      const index = products.findIndex((element) => {
        return element.product.toString() == product.toString();
      });
      if (index != -1) {
        if (products[index].quantity === 1) {
          products.splice(index, index + 1);
        } else {
          products[index].quantity = products[index].quantity - 1;
        }
      }

      try {
        const updatedCart = await Cart.findOneAndUpdate(
          { user },
          {
            products,

            totalAmount,
          }, // Use $each to push multiple items
          { new: true }
        );

        if (updatedCart) {
          return res.status(200).send({
            success: true,
            data: updatedCart,
          });
        } else {
          return res.status(404).send({
            success: false,
            error: "Cart not found",
          });
        }
      } catch (err) {
        console.log(err)
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
    let { user } = req.params;
    try {
      // Find if the Cart already exists
      const CartExists = await Cart.find({ user })
        .populate("company")
        .populate({
          path: "products",
          populate: {
            path: "product",
          },
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
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in Model function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // .........................................clear Cart api.............................
  async clearCart(req, res) {
    let { user } = req.body;
    try {
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
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in Model function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },
};

module.exports = CartController;
