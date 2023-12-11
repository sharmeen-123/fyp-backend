const express = require("express");
const headRouter = require("./user");
const categoryRouter = require("./category");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello from server");
});

router.use("/auth", headRouter);
router.use("/category", categoryRouter);

module.exports = router;

