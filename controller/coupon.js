const Coupon = require("../models/coupon");
const Wallet = require("../models/wallet");

const CouponController = {
  async addCoupon(req, res) {
    let CouponData = req.body;
    const date = new Date();
    CouponData.issueDate = date;
    CouponData.unCollected = CouponData.distributedCoupons;

    try {
      // Check if a coupon with the same name already exists
      const existingCoupon = await Coupon.findOne({
        name: CouponData.name,
        company: CouponData.company,
        expiry: { $gt: date },
      });

      if (existingCoupon) {
        return res.status(400).send({
          success: false,
          error: "Coupon with this name already exists.",
        });
      } else {
        let coupon = new Coupon(CouponData);

        // Save the Coupon to the database
        coupon.save((error, addNewCoupon) => {
          if (error) {
            return res.status(500).send({
              success: false,
              error: error.message,
            });
          }
          res.status(200).send({
            success: true,
            message: "New coupon added successfully",
            data: {
              name: addNewCoupon.name,
              _id: addNewCoupon._id,
            },
          });
        });
      }
    } catch (err) {
      console.log("err is", err);
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

  // get Coupon by company id api
  async getCoupon(req, res) {
    let { company } = req.params;
    let totalCoupons = 0;
    let collectedCoupons = 0;
    let availedCoupons = 0;
    let expired = 0;

    try {
      // Find if the Coupon already exists
      const data = await Coupon.find({
        company,
      }).sort({ issueDate: -1 });

      if (data) {
        const currentDate = new Date();
        data.map((val) => {
          totalCoupons += val.distributedCoupons;
          collectedCoupons += val.collected;
          availedCoupons += val.availed;

          // Parsing expiry date
          const expiryDate = new Date(val.expiry);

          // Check if the expiry date is valid and greater than or equal to the current date
          const expiryy = new Date(val.expiry).toLocaleDateString();
          const current = currentDate.toLocaleDateString();

          if (!isNaN(expiryDate.getTime()) && expiryy < current) {
            expired += val.unCollected;
          }
        });
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: {
            total: totalCoupons,
            availed: availedCoupons,
            collected: collectedCoupons,
            expired: expired,
            coupons: data,
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "no coupons exist",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

  // get Coupon and payment by company id api
  async getCouponWithCard(req, res) {
    let { company } = req.params;

    try {
      // Find if the Coupon already exists
      const data = await Coupon.find({
        company,
      })
        .populate("cardId")
        .sort({ issueDate: -1 });

      if (data) {
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: data,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "no coupons exist",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

  // get Coupon that can be collected
  async getCoupontoCollect(req, res) {
    let { user } = req.params;

    console.log("user is", user);
    try {
      // Find if the Coupon already exists
      const data = await Coupon.find({
        expiry: { $gt: new Date() }, // Expiry date greater than today
        unCollected: { $gt: 0 }, // Uncollected count greater than 0
        locations: {
          $not: {
            $elemMatch: { user: user }, // User not in the array of locations
          },
        },
      }).sort({ issueDate: -1 });

      let coupons = []
      data.map((val, ind) => {
        val.locations.map((val2, ind2) => {
          if(val2.collected == false){
            let coupon = {
              id: val._id,
              company: val.company,
              discount: val.discount,
              issueDate: val.issueDate,
              expiry: val.expiry,
              name: val.name,
              lat: val2.lat,
              lng: val2.lng
            }
            coupons.push(coupon)
          }
        })
      })

      if (data.length) {
        return res.status(200).send({
          success: true,
          data:{
            message: "Coupon Found",
            coupons: coupons,
          }
         
        });
      } else {
        return res.status(400).send({
          success: false,
          data:{
            error: "no coupons exist",
          }
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        data: {error: "Some Error Occurred"},
      });
    }
  },

  // get Coupon by id api
  async getCouponById(req, res) {
    let { id } = req.params;

    try {
      // Find if the Coupon already exists
      const data = await Coupon.find({
        _id: id,
      });

      if (data.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: data,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Coupon with this name do not exists",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

  // get Coupon by id api
  async getComapiesOfferingCoupons(req, res) {
    try {
      // Find if the Coupon already exists
      const data = await Coupon.aggregate([
        {
          $group: {
            _id: "$company",
            company: { $first: "$company" },
          },
        },
        {
          $lookup: {
            from: "users", // Assuming 'companies' is the name of your companies collection
            localField: "company",
            foreignField: "_id",
            as: "company_details",
          },
        },
        {
          $unwind: "$company_details",
        },
        {
          $replaceRoot: { newRoot: "$company_details" },
        },
      ]);

      // Now data will contain an array of objects, each representing a unique company.

      if (data)
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data: data,
        });
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

  // update Coupon api
  async collectCoupon(req, res, next) {
    const { user, id, lng, lat } = req.body;

    const couponExists = await Coupon.findOne({
      _id: id,
    });


    // wallet object
    const date = new Date();
    const WalletData = {
      coupon: id,
      company:couponExists.company,
      collectedAt: date,
      user: user,
    };
    let wallet = new Wallet(WalletData);
    console.log(wallet);

    try {
      const coupon = await Coupon.findOne({
        _id: id,
      });

      if (coupon) {
        let locations = coupon.locations;
        let collected = coupon.collected + 1;
        let unCollected = coupon.unCollected - 1;
        let distributedCoupons = coupon.distributedCoupons - 1;

        let index = locations.findIndex(findCoupon);
        function findCoupon(location) {
          let ind =
            location.lng == lng && location.lat == lat && !location.collected;

          return ind;
        }
        console.log("index is", index);

        if (index != -1) {
          locations[index].collected = true;
          locations[index].user = user;

          console.log("in if", locations[index]);
          const updatedCoupon = await Coupon.findOneAndUpdate(
            { _id: id },
            { locations, collected, unCollected, distributedCoupons },
            { new: true }
          );

          if (updatedCoupon) {
            // Save the wallet to the database
            wallet.save((error, addNewWallet) => {
              if (error) {
                return res.status(500).send({
                  success: false,
                  error: error.message,
                });
              }
              res.status(200).send({
                success: true,
                message: "coupon collected",
                data: {
                  coupon: updatedCoupon,
                  wallet: addNewWallet,
                },
              });
            });
          }
        } else {
          return res.status(404).send({
            success: false,
            error: "Incorrect location or coupon already availed",
          });
        }
      } else {
        return res.status(404).send({
          success: false,
          error: "Coupon not found",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in  function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // avail Coupon api
  async availCoupon(req, res, next) {
    const { id } = req.body;
    try {
      const coupon = await Coupon.findOne({
        _id: id,
      });

      if (coupon) {
        let availed = coupon.availed + 1;

        const updatedCoupon = await Coupon.findOneAndUpdate(
          { _id: id },
          { availed },
          { new: true }
        );

        if (updatedCoupon) {
          const updatedWallet = await Wallet.findOneAndUpdate(
            { coupon: id },
            { availed: true },
            { new: true }
          );

          if (updatedWallet) {
            return res.status(200).send({
              success: true,
              message: "Coupon updated successfully",
              data: updatedCoupon,
            });
          }
        } else {
          return res.status(404).send({
            success: false,
            error: "Coupon not found",
          });
        }
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in  function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },
};

module.exports = CouponController;
