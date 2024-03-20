const PaymentMethod = require("../models/paymentMethod");

const PaymentMethodController = {
  // addPaymentMethod api
  async addPaymentMethod(req, res) {
    try {
      let PaymentMethodData = req.body;
      console.log("payment method", PaymentMethodData);
      let paymentMethod = new PaymentMethod(PaymentMethodData);

      // Find if the PaymentMethod already exists
      const paymentMethodExists = await PaymentMethod.findOne({
        cardNo: paymentMethod.cardNo,
      });

      if (paymentMethodExists) {
        return res.status(400).send({
          success: false,
          error: "PaymentMethod with this number already exists",
        });
      }

      // Save the PaymentMethod to the database
      paymentMethod.save((error, addNewPaymentMethod) => {
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }
        res.status(200).send({
          success: true,
          message: "new paymentMethod added successfully",
          data:{

            name: addNewPaymentMethod.name,
            _id: addNewPaymentMethod._id,
          }
        });
      });
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in PaymentMethod function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get PaymentMethod api
  async getPaymentMethod(req, res) {
    let { user } = req.params;
    try {
      // Find if the PaymentMethod already exists
      const paymentMethodExists = await PaymentMethod.find({ user });
      console.log(paymentMethodExists, "user", user);

      if (paymentMethodExists) {
        return res.status(200).send({
          success: true,
          message: "PaymentMethod Found",
          data: paymentMethodExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "PaymentMethod with this user do not exists",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in PaymentMethod function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // delete method api
  async deletePaymentMethod(req, res) {
    let id = req.params.id;

    try {
      const paymentMethodDeleted = await PaymentMethod.findOneAndDelete({
        _id: id,
      });
      if (paymentMethodDeleted) {
        return res.status(200).send({
          success: true,
          message: "PaymentMethod Deleted Successfully",
          // data: PaymentMethodExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Unable to delete PaymentMethod",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // edit product
  async setDefault(req, res) {
    try {
      const id = req.params.id;
      const company = req.params.company;

      console.log(id, "company", company)

      if (!id) {
        res.status(400).send({
          success: false,
          error: "Method id is empty",
        });
      } else {
        const paymentMethodExists = await PaymentMethod.findOneAndUpdate(
          { user: company,
          setDefault: true },
          { setDefault: false }
        );
        const setDefaultt = await PaymentMethod.findOneAndUpdate(
          { _id: id, user: company },
          { setDefault: true },
          { new: true } 
      );
      
      if (setDefaultt) {
          console.log("updated method is", setDefaultt);
          // Send only the necessary properties of the object in the response
          res.status(200).send({
              success: true,
              message: "default method updated",
              data: {
                  _id: setDefaultt._id,
                  setDefault : setDefaultt.setDefault
                  // Add other necessary properties here
              }
          });
      } else {
          res.status(400).send({
              success: false,
              message: "method not updated",
          });
      }
      
         
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

module.exports = PaymentMethodController;
