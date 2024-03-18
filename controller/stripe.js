const stripe = require("stripe")(
    "sk_test_51OvIPTFwZYAVAKRZNOMZbMhurTnF1DD31Hu1RM844WzfK6Wk14zuysHuAFrn0ODOXQJzZ7mgJ1pKkVtWIIW7ilgK007naNI5D9"
  );
  const PaymentMethod = require("../models/paymentMethod");
  
  const StripeController = {
    async createPayment(req, res, next) {
      try {
        const id = req.body.card;
        if (id) {
          const paymentMethodd = await PaymentMethod.findById(id);
          if (!paymentMethodd) {
            throw new Error("Payment method not found");
          }
          
        
          
          // Assuming data.cardNo holds the card information
          const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount * 100,
            currency: "usd",
            automatic_payment_methods: {
              enabled: true,
            }
          });
          res.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
          });
        } else {
          throw new Error("Card ID not provided");
        }
      } catch (err) {
        next(err);
      }
    },
   
  };
  
  module.exports = StripeController;
  