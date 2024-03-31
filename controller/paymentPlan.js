const PaymentPlan = require("../models/paymentPlan");

const PaymentPlanController = {
  // addPaymentPlan api
  async addPaymentPlan(req, res) {
    try {
      let PaymentPlanData = req.body;
      let paymentPlan = new PaymentPlan(PaymentPlanData);

      // Find if the PaymentPlan already exists
      const paymentPlanExists = await PaymentPlan.findOne({
        name: paymentPlan.name,
      });

      if (paymentPlanExists) {
        return res.status(400).send({
          success: false,
          error: "PaymentPlan with this name already exists",
        });
      }

      // Save the PaymentPlan to the database
      paymentPlan.save((error, addNewPaymentPlan) => {
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }
        res.status(200).send({
          success: true,
          message: "new paymentPlan added successfully",
          
          name: addNewPaymentPlan.name,
          _id: addNewPaymentPlan._id,
        });
      });
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get PaymentPlan api
  async getPaymentPlan(req, res) {
    try {
      // Find if the PaymentPlan already exists
      const paymentPlanExists = await PaymentPlan.find({ });

      if (paymentPlanExists) {
        return res.status(200).send({
          success: true,
          message: "PaymentPlan Found",
          data: paymentPlanExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "PaymentPlan with this user do not exists",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // delete method api
  async deletePaymentPlan(req, res) {
    let id = req.params.id;

    try {
      const paymentPlanDeleted = await PaymentPlan.findOneAndDelete({
        _id: id,
      });
      if (paymentPlanDeleted) {
        return res.status(200).send({
          success: true,
          message: "PaymentPlan Deleted Successfully",
          // data: PaymentPlanExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Unable to delete PaymentPlan",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

   // edit paymentPlan
   async editPaymentPlan(req, res) {
    try {
      const id = req.params.id;
     

      if (!id) {
        code = 400;
        sendingData = {
          success: false,
          error: "PaymentPlan ID is empty",
        };
      }

      const plan = await PaymentPlan.findOneAndUpdate(
        { _id: id },
        req.body
      )
        .then((res) => {
          code = 200;
          sendingData = {
            success: true,
            error: "details updated successfully",
          };
        })
        .catch((err) => {
          code = 500;
          sendingData = {
            success: false,
            error: "Some Error Occured",
          };
        });

      res.status(code).send({
        data: sendingData,
      });
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

};

module.exports = PaymentPlanController;
