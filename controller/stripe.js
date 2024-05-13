const dotenv = require("dotenv");
dotenv.config();

const stripe = require("stripe")(
    process.env.STRIPE_KEY
);
const PaymentMethod = require("../models/paymentMethod");

const StripeController = {
  async createPayment(req, res, next) {
      try {
          const id = req.body.card;
          const {success_url, cancel_url} = req.body
          if (id) {
              const paymentMethodd = await PaymentMethod.findById(id);
              if (!paymentMethodd) {
                  throw new Error("Payment method not found");
              }

              const session = await stripe.checkout.sessions.create({
                  payment_method_types: ['card'],
                  line_items: [{
                      price_data: {
                          currency: 'usd',
                          product_data: {
                              name: 'Coupon',
                          },
                          unit_amount: req.body.amount * 100,
                      },
                      quantity: 1,
                  }],
                  mode: "payment",
                  success_url: success_url,
                  cancel_url: cancel_url,
              });
              
              // res.redirect(303, session.url);

              res.json({
                  clientSecret: session.client_secret,
                  id: session.id,
                  url: session.url
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
