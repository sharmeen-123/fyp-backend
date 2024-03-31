const express = require("express");
const headRouter = require("./user");
const categoryRouter = require("./category");
const productRouter = require("./product");
const cartRouter = require("./cart")
const reviewRouter = require("./review")
const modelRouter = require("./model")
const couponRouter = require("./coupon")
const paymentMethodRouter = require("./paymentMethod")
const paymentPlanRouter = require("./paymentPlan")
const stripe = require("./stripe")

const walletRouter = require("./wallet")
const pathh = require('./getAbsolutePath')
const authGuard = require("../middleware/authGuard");


const router = express.Router();

// router.use(express.static(path.join(__dirname, 'public')));


router.get("/", (req, res) => {
  res.send("hello from server");
});

router.use("/auth", headRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use('/cart', cartRouter);
router.use('/review', reviewRouter);
router.use('/model',authGuard, modelRouter);
router.use('/coupon', couponRouter);
router.use('/payments', paymentMethodRouter);
router.use('/wallet', walletRouter);
router.use('/plans', paymentPlanRouter);
router.use('/stripe', stripe);

router.use('/images', pathh);


module.exports = router;

