const express = require("express");
const headRouter = require("./user");
const categoryRouter = require("./category");
const productRouter = require("./product");
const cartRouter = require("./cart");

const orderRouter = require("./order")
const reviewRouter = require("./review")
const modelRouter = require("./model")
const couponRouter = require("./coupon")

const companyWalletRouter = require("./companyWallet")
const paymentMethodRouter = require("./paymentMethod")
const paymentPlanRouter = require("./paymentPlan")
const stripe = require("./stripe")
const dashboardRouter = require("./dashboard")
const walletRouter = require("./wallet")
const pathh = require('./getAbsolutePath')
const authGuard = require("../middleware/authGuard");


const router = express.Router();

// router.use(express.static(path.join(__dirname, 'public')));


router.get("/", (req, res) => {
  res.send("hello from server");
});

router.use("/auth", headRouter);
router.use('/coupon', couponRouter);
router.use('/cart', cartRouter);
router.use("/category", categoryRouter);
router.use('/companyWallet', companyWalletRouter);
router.use('/dashboard', dashboardRouter);
router.use('/model',authGuard, modelRouter);
router.use('/order', orderRouter);
router.use('/payments', paymentMethodRouter);
router.use('/plans', paymentPlanRouter);
router.use("/product", productRouter);
router.use('/review', reviewRouter);
router.use('/stripe', stripe);
router.use('/wallet', walletRouter);

router.use('/images', pathh);


module.exports = router;

