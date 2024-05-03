const Order = require("../models/order");

const OrderController = {
  // addOrder api
  async addOrder(req, res) {
    let {user, } = req.body;
    try {
      let order = new Order(OrderData);

      // Find if the Order already exists
      const orderExists = await Order.findOne({
        name: order.name,
      });

      if (orderExists) {
        return res.status(400).send({
          success: false,
          error: "Order with this name already exists",
        });
      }

      // Save the Order to the database
      order.save((error, addNewOrder) => {
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }
        res.status(200).send({
          success: true,
          message: "new order added successfully",
          name: addNewOrder.name,
          _id: addNewOrder._id,
        });
      });
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in Model function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get Order api
  async getOrder(req, res) {
    let { name } = req.body;
    try {
      // Find if the Order already exists
      const orderExists = await Order.find({}).sort({ createdAt : -1 });

      if (orderExists) {
        const data = [];
        orderExists.map((val, ind) => {
          
            data.push({
              name: val.name,
              _id: val._id,
              selected: false,
            });
          
        });
        return res.status(200).send({
          success: true,
          message: "Order Found",
          data: data,
          categories : orderExists
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Order with this name do not exists",
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

module.exports = OrderController;
