const Coupon = require("../models/coupon");
const User = require("../models/user");

const CouponController = {
 
  // .......................................get Coupon api.........................................
  async getCoupon(req, res) {
    try {

      // Find if the Coupon already exists
      const CouponExists = await Coupon.find({ });
      
      const UserExists = await User.find({ });

      if (CouponExists) {
        let distributeCoupons = 0
        let collectedCoupons = 0
        let users = 0

        if(UserExists.length > 0){
            users = UserExists.length
        }

        CouponExists.map((val, ind)=> {
            distributeCoupons += val.distributedCoupons;
            collectedCoupons += val.collected
        })

        if(distributeCoupons > 1000){
        distributeCoupons = distributeCoupons/1000
        distributeCoupons = distributeCoupons+' K'
    }
        if(collectedCoupons > 1000){
        collectedCoupons = collectedCoupons/1000
        collectedCoupons = collectedCoupons + ' K'
    }

    if(users > 1000){
        users = users/1000
        users = users + ' K'
    }
        
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data:{
            distributed:distributeCoupons,
            collected: collectedCoupons,
            users
          }
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

  async getCompanyCards(req, res) {
    try {

      // Find if the Coupon already exists
      const {company} = req.params
      const CouponExists = await Coupon.find({ company});
     

      if (CouponExists) {
        let distributeCoupons = 0
        let collectedCoupons = 0
        let availedCoupons = 0
        let users = 0

       

        CouponExists.map((val, ind)=> {
            distributeCoupons += val.distributedCoupons;
            collectedCoupons += val.collected
            availedCoupons += val.availed
        })

        if(distributeCoupons > 1000){
        distributeCoupons = distributeCoupons/1000
        distributeCoupons = distributeCoupons+' K'
    }
        if(collectedCoupons > 1000){
        collectedCoupons = collectedCoupons/1000
        collectedCoupons = collectedCoupons + ' K'
    }

    if(availedCoupons > 1000){
        availedCoupons = availedCoupons/1000
        availedCoupons = availedCoupons + ' K'
    }
        
        return res.status(200).send({
          success: true,
          message: "Coupon Found",
          data:{
            distributed:distributeCoupons,
            collected: collectedCoupons,
            availed : availedCoupons
          }
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

};

module.exports = CouponController;
