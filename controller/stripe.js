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
                  success_url: "http://localhost:3000/company/coupon",
                  cancel_url: "http://localhost:3000/company/distributeCoupon",
              });

              console.log("url is", session.url)
              
              // res.redirect(303, session.url);

              res.json({
                  clientSecret: session.client_secret,
                  id: session.id,
                  url: session.url
              });

              // res.redirect(303, session.url);
          } else {
              throw new Error("Card ID not provided");
          }
      } catch (err) {
          next(err);
      }
  },
 
};

module.exports = StripeController;
