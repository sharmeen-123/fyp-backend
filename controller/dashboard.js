const Coupon = require("../models/coupon");
const User = require("../models/user");
const Products = require("../models/product");
const Order = require("../models/order");
const Model = require("../models/model");
const Wallet = require("../models/wallet");
const mongoose = require("mongoose");

const CouponController = {
  // .......................................get Coupon api.........................................
  async getCoupon(req, res) {
    try {
      // Find if the Coupon already exists
      const CouponExists = await Coupon.find({});

      const UserExists = await User.find({});
      const OrderExists = await Order.find({});

      if (CouponExists) {
        let distributeCoupons = 0;
        let collectedCoupons = 0;
        let users = 0;
        let estimatedDiscount = 0;
        let total = 0;
        
        const currentDate = new Date();
        let highestSale = 0;

        if (UserExists.length > 0) {
          users = UserExists.length;
        }

        OrderExists.map((val, ind) => {
          total += val.totalAmount
          estimatedDiscount += val.discountedPrice
          if (val.date.getMonth() === currentDate.getMonth() && val.date.getFullYear() === currentDate.getFullYear()) {
            if (highestSale < val.totalAmount) {
                highestSale = val.totalAmount;
            }
        }
        })

        estimatedDiscount = total - estimatedDiscount

        CouponExists.map((val, ind) => {
          distributeCoupons += val.distributedCoupons;
          collectedCoupons += val.collected;
        });

        if (distributeCoupons > 1000) {
          distributeCoupons = distributeCoupons / 1000;
          distributeCoupons = distributeCoupons + " K";
        }
        if (collectedCoupons > 1000) {
          collectedCoupons = collectedCoupons / 1000;
          collectedCoupons = collectedCoupons + " K";
        }

        if (estimatedDiscount > 1000) {
          estimatedDiscount = estimatedDiscount / 1000;
          estimatedDiscount = '$ '+ estimatedDiscount + " K";
        }else{
          estimatedDiscount = '$ '+ estimatedDiscount
        }

        if (users > 1000) {
          users = users / 1000;
          users = users + " K";
        }

        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: {
            distributed: distributeCoupons,
            collected: collectedCoupons,
            users,estimatedDiscount, highestSale
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Coupon with this id do not exists",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // company top cards

  async getTopCards(req, res) {
    try {
      // Find if the Coupon already exists
      const { company } = req.params;
      const CouponExists = await Coupon.find({ company });
      const ProductExists = await Products.find({ company });
      const ModelExists = await Model.find({ companyId: company });
      const OrderExists = await Order.find({ company });

      if (CouponExists) {
        let distributeCoupons = 0;
        let collectedCoupons = 0;
        let availedCoupons = 0;
        let totalProducts = 0;
        let models = 0;
        let orders = 0;
        let totalRevenue = 0;
        let discount = 0;
        let total = 0;

        OrderExists.map((val, ind) => {
          total += val.totalAmount;
          totalRevenue += val.discountedPrice;
        });

        discount = total - totalRevenue;

        if (ProductExists.length > 0) {
          totalProducts = ProductExists.length;
        }
        if (OrderExists.length > 0) {
          orders = OrderExists.length;
        }
        if (ModelExists.length > 0) {
          models = ModelExists.length;
        }
        CouponExists.map((val, ind) => {
          distributeCoupons += val.distributedCoupons;
          collectedCoupons += val.collected;
          availedCoupons += val.availed;
        });

        if (distributeCoupons > 1000) {
          distributeCoupons = distributeCoupons / 1000;
          distributeCoupons = distributeCoupons + " K";
        }
        if (collectedCoupons > 1000) {
          collectedCoupons = collectedCoupons / 1000;
          collectedCoupons = collectedCoupons + " K";
        }

        if (availedCoupons > 1000) {
          availedCoupons = availedCoupons / 1000;
          availedCoupons = availedCoupons + " K";
        }

        if (totalProducts > 1000) {
          totalProducts = totalProducts / 1000;
          totalProducts = totalProducts + " K";
        }

        if (models > 1000) {
          models = models / 1000;
          models = models + " K";
        }

        if (orders > 1000) {
          orders = orders / 1000;
          orders = orders + " K";
        }

        if (discount > 1000) {
          discount = discount / 1000;
          discount = "$ " + discount + " K";
        }else{
          discount = "$ " + discount 
        }

        if (totalRevenue > 1000) {
          totalRevenue = totalRevenue / 1000;
          totalRevenue = '$ ' + totalRevenue + " K";
        }else{
          totalRevenue = '$ ' + totalRevenue 
        }

        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: {
            distributed: distributeCoupons,
            collected: collectedCoupons,
            availed: availedCoupons,
            totalProducts: totalProducts,
            orders,
            models,
            totalRevenue,
            discount,
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Coupon with this id do not exists",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // company coupon table

  async companyCouponTable(req, res) {
    try {
      // Find if the Coupon already exists
      const { company } = req.params;
      const CouponExists = await Wallet.find({ company })
        .populate({ path: "coupon", select: "name issueDate expiry discount" })
        .sort({ collectedAt: -1 });

      if (CouponExists.length > 0) {

        const couponData = CouponExists.map((val, ind) => {
          const formattedExpiry = `${
            val.coupon.expiry.getMonth() + 1
          }/${val.coupon.expiry.getDate()}/${val.coupon.expiry.getFullYear()}`;


          const formattedCollected = `${
            val.collectedAt.getMonth() + 1
          }/${val.collectedAt.getDate()}/${val.collectedAt.getFullYear()}`;

          const formattedIssue = `${
            val.coupon.issueDate.getMonth() + 1
          }/${val.coupon.issueDate.getDate()}/${val.coupon.issueDate.getFullYear()}`;

          return {
            name: val.coupon.name,
            discount: val.coupon.discount,
            expiry: formattedExpiry,
            issueDate: formattedIssue,
            collectedAt: formattedCollected,

          };

        });
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: {
            coupons: couponData,
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Coupon with this id do not exists",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

   // company pie chart
   async companyPieChart(req, res) {
    try {
      // Find if the Coupon already exists
      const { company } = req.params;
      const coupons = await Coupon.find({ company, expiry: { $gt: new Date() } });
      let distributed = 0;
      let availed = 0;
      let collected = 0;

      coupons.map((val, ind) => {
       distributed += val.distributedCoupons,
       availed += val.availed,
       collected += val.collected
    }
  );
     if(coupons){
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: {
            distributed, availed, collected
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Coupon with this id do not exists",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },


  async  companyBarChart(req, res) {
    try {
      const { company } = req.params;
      const currentDate = new Date();

      const formattedSales = [];

      for (let i = 0; i < 12; i++) {
          const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

          const sales = await mongoose.model('order').aggregate([
              {
                  $match: {
                      company: mongoose.Types.ObjectId(company),
                      date: {
                          $gte: startDate,
                          $lte: endDate
                      }
                  }
              },
              {
                  $group: {
                      _id: null,
                      totalDiscountedPrice: { $sum: "$discountedPrice" }
                  }
              }
          ]);

          const month = startDate.toLocaleString('default', { month: 'short' });
          const value = sales.length > 0 ? sales[0].totalDiscountedPrice : 0;

          formattedSales.unshift({name: month, value });
      }

      return res.status(200).send({
          success: true,
          message: "Sales data retrieved successfully",
          data: formattedSales
      });
  } catch (error) {
      console.error(error);
      return res.status(500).send({
          success: false,
          error: "Internal server error"
      });
  }
},

// admin
async  adminBarChart(req, res) {
  try {
    const currentDate = new Date();

    const formattedSales = [];

    for (let i = 0; i < 12; i++) {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

        const sales = await mongoose.model('order').aggregate([
            {
                $match: {
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDiscountedPrice: { $sum: "$discountedPrice" }
                }
            }
        ]);

        const month = startDate.toLocaleString('default', { month: 'short' });
        const value = sales.length > 0 ? sales[0].totalDiscountedPrice : 0;

        formattedSales.unshift({name: month, value });
    }

    return res.status(200).send({
        success: true,
        message: "Sales data retrieved successfully",
        data: formattedSales
    });
} catch (error) {
    console.error(error);
    return res.status(500).send({
        success: false,
        error: "Internal server error"
    });
}
},

};

module.exports = CouponController;
