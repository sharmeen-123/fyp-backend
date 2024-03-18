const Coupon = require("../models/coupon");
const Wallet = require("../models/wallet");

const CouponController = {
  // addCoupon api
  async addCoupon(req, res) {
    let CouponData = req.body;
    console.log(req.body);
    const date = new Date();
    CouponData.issueDate = date;
    CouponData.unCollected = CouponData.distributedCoupons;

    try {
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
          message: "new coupon added successfully",
          name: addNewCoupon.name,
          _id: addNewCoupon._id,
        });
      });
    } catch (err) {
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
      });

      if (data) {
        const currentDate = new Date();
        data.map((val) => {
          totalCoupons += val.distributedCoupons;
          collectedCoupons += val.collected;
          availedCoupons += val.availed;

    // Parsing expiry date
    const expiryDate = new Date(val.expiry);

    // Check if the expiry date is valid and greater than or equal to the current date
    const expiryy = new Date(val.expiry).toLocaleDateString()
    const current = currentDate.toLocaleDateString();


    if (!isNaN(expiryDate.getTime()) && expiryy < current) {
        expired += val.unCollected;
        console.log("Expiry Date:", expiryy, "Current Date:",current );
 
    }
        });
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          total : totalCoupons,
          availed: availedCoupons,
          collected: collectedCoupons,
          expired: expired,
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

  // update Coupon api
  async collectCoupon(req, res, next) {
    const { user, id, lng, lat } = req.body;

    // wallet object
    const date = new Date();
    const WalletData = {
      coupon: id,
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
            location.lng == lng && location.lat == lat && !location.user;
          return ind;
        }

        if (index != -1) {
          locations[index].collected = true;
          locations[index].user = user;
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
                coupon: updatedCoupon,
                wallet: addNewWallet,
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
              coupon: updatedCoupon,
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