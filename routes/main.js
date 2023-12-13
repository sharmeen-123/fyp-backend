const express = require("express");
const headRouter = require("./user");
const categoryRouter = require("./category");
const productRouter = require("./product");
const path = require('path');

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
router.use('/images', pathh);


module.exports = router;

