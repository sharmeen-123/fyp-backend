const Order = require("../models/order");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Wallet = require("../models/wallet");
const Product = require("../models/product");
const User = require("../models/user");
const CompanyWallet = require("../models/CompanyWallet");

const OrderController = {
  // addOrder api
  async addOrder(req, res) {
    let { user, coupon, orderID, cardNo } = req.body;
    try {
      let cartExists = await Cart.findOne({
        user,
      });
      let CouponExists;
      let WalletExists = "";

      if (cartExists) {
        // some thing to order
        if (coupon != "") {
          CouponExists = await Coupon.findOne({
            _id: coupon,
          });
        }
        if (coupon != "") {
          WalletExists = await Wallet.findOne({
            coupon,
            user,
            availed: false,
          });
        }

        let discountedPrice = cartExists.discountedAmount;
        let companyWallet;

        if (coupon != "") {
          discountedPrice =
            cartExists.totalAmount -
            (cartExists.totalAmount * CouponExists.discount) / 100;

          let walletData = {
            from: user,
            to: cartExists.company,
            amount: discountedPrice,
            cardNo,
            orderID,
          };

          companyWallet = new CompanyWallet(walletData);
          companyWallet.save();
        }

        // update products
        let products = cartExists.products;
        products.map(async (val, ind) => {
          let ProductExist = await Product.findOne({ _id: val.product });

          if (ProductExist.quantity >= val.quantity) {
            let qty = ProductExist.quantity - val.quantity;
            let product = await Product.findOneAndUpdate(
              { _id: val.product },
              {
                quantity: qty,
              },
              { new: true }
            );

            if (coupon != "") {
              // update coupon

              const availed = CouponExists.availed + 1;
              const unCollected = CouponExists.unCollected - 1;

              const updatedCoupon = await Coupon.findOneAndUpdate(
                { _id: coupon },
                {
                  availed,
                  unCollected,
                },
                { new: true }
              );

              const updatedWallet = await Wallet.findOneAndUpdate(
                { coupon: coupon },
                {
                  availed: true,
                },
                { new: true }
              );
            }
            let orderData;

            if (coupon != "") {
              orderData = {
                user: cartExists.user,
                company: cartExists.company,
                products: cartExists.products,
                address: cartExists.address,
                totalAmount: cartExists.totalAmount,
                city: cartExists.city,
                postalCode: cartExists.postalCode,
                coupon,
                discountedPrice,
                orderID,
                cardNo,
              };
            } else {
              orderData = {
                user: cartExists.user,
                company: cartExists.company,
                products: cartExists.products,
                address: cartExists.address,
                totalAmount: cartExists.totalAmount,
                city: cartExists.city,
                postalCode: cartExists.postalCode,
                discountedPrice,
                orderID,
                cardNo,
              };
            }

            let order = new Order(orderData);

            const CartDeleted = await Cart.findOneAndUpdate({
              user,
            }, {
              totalAmount: 0,
              discountedAmount: 0,
              products: []
            });
      
            // save order

            order.save((error, addNewOrder) => {
              if (error) {
                return res.status(500).send({
                  success: false,
                  error: error.message,
                });
              }
              res.status(200).send({
                success: true,
                data: {
                  message: "new order added successfully",
                },
              });
            });
          } else {
            return res.status(400).send({
              success: false,
              data: {
                error: `${ProductExist.name} are only ${ProductExist.quantity} in stock`,
              },
            });
          }
        });
      } else {
        // empty cart
        return res.status(400).send({
          success: false,
          data: {
            error: "First add something in cart to order it",
          },
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.log(error);
      return res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // api to apply coupon
  async checkValidCoupon(req, res) {
    try {
      const { coupon, user } = req.params;
      let cartExists = await Cart.findOne({
        user,
      });
      if (cartExists) {
        let CouponExists = await Coupon.findOne({
          _id: coupon,
        });
        let WalletExists = await Wallet.findOne({
          coupon,
          user,
          availed: false,
        });

        let discountedPrice = cartExists.totalAmount;
        if (WalletExists) {
          discountedPrice =
            cartExists.totalAmount -
            (cartExists.totalAmount * CouponExists.discount) / 100;
          return res.status(200).send({
            success: true,
            data: {
              totalPrice: cartExists.totalAmount,
              discountedPrice: discountedPrice,
            },
          });
        } else {
          return res.status(400).send({
            success: false,
            data: {
              error:
                "Coupon is not present in your wallet or is already availed",
            },
          });
        }
      } else {
        return res.status(400).send({
          success: false,
          data: {
            error: "No product is added in cart yet",
          },
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      return res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get Order api for customer
  async getOrder(req, res) {
    let { user } = req.params;
    try {
      // Find if the Order already exists
      const orderExists = await Order.find({ user })
        .sort({ date: -1 })
        .populate({
          path: "products",
          populate: {
            path: "product",
            select: "name price images",
          },
        })
        .populate({
          path: "company",
          select: "name image",
        });

      const orders = orderExists.map((val, ind) => {
        let order = {
          orderId: val.orderID,
          products: val.products,
          company: val.company,
          totalAmount: val.totalAmount,
          discountedAmount: val.discountedPrice,
        };
        return order;
      });

      if (orderExists.length > 0) {
        return res.status(200).send({
          success: true,
          data: {
            message: "Order Found",
            orders: orders,
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Order with this id do not exists",
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get Order api for company
  async getCompanyOrder(req, res) {
    let { company } = req.params;
    try {
      // Find if the Order already exists
      const orderExists = await Order.find({ company })
        .sort({ date: -1 })
        .populate({
          path: "products",
          populate: {
            path: "product",
            select: "name images price quantity description",
          },
        })
        .populate({
          path: "user",
          select: "name image contact",
        });

      if (orderExists.length > 0) {
        return res.status(200).send({
          success: true,
          data: {
            message: "Order Found",
            orders: orderExists,
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Order with this id do not exists",
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get wallet api for company
  async getCompanyWallet(req, res) {
    let { company } = req.params;
    try {
      // Find if the Order already exists
      const orderExists = await Order.find({ company })
        .sort({ date: -1 })
        .populate({
          path: "user",
          select: "name image email",
        })
        .populate({
          path: "coupon",
          select: "discount",
        });
      let totalSale = 0;
      let discount = 0;
      let discountedAmount = 0;

      let order = orderExists.map((val, ind) => {
        totalSale += val.totalAmount;
        discountedAmount += val.discountedPrice;
        return {
          name: val.user.name,
          image: val.user.image,
          email: val.user.email,
          discount: val.coupon.discount,
          date: val.date,
          discountPrice: val.discountedPrice,
          amount: val.totalAmount,
        };
      });
      discount = totalSale - discountedAmount;
      if (totalSale > 1000) {
        totalSale = totalSale / 1000 + "K";
      }
      if (discountedAmount > 1000) {
        discountedAmount = discountedAmount / 1000 + "K";
      }
      if (discount > 1000) {
        discount = discount / 1000 + "K";
      }

      if (orderExists.length > 0) {
        return res.status(200).send({
          success: true,
          data: {
            message: "Wallet Found",
            totalSale,
            discountedAmount,
            discount,
            wallets: order,
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Wallet with this id do not exists",
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },
};

module.exports = OrderController;
