const Wallet = require("../models/wallet");

const WalletController = {
  // addWallet api
  async addWallet(req, res) {
    let WalletData = req.body;
    const date = new Date();
    WalletData.issueDate = date;
    WalletData.unCollected = WalletData.distributedWallets;

    // add locations
    const lat = parseFloat(WalletData.latitude);
    const lon = parseFloat(WalletData.longitude);
    const rad = parseFloat(WalletData.radius);
    const numWallets = parseInt(WalletData.distributedWallets);

    const wallets = [];
    for (let i = 0; i < numWallets; i++) {
      const randomLat = lat + (Math.random() * 2 - 1) * (rad / 111);
      const randomLon =
        lon +
        (Math.random() * 2 - 1) *
          (rad / (111 * Math.cos((lat * Math.PI) / 180)));
      wallets.push({ latitude: randomLat, longitude: randomLon });
    }

    WalletData.locations = wallets;

    try {
      let wallet = new Wallet(WalletData);

      // Save the Wallet to the database
      wallet.save((error, addNewWallet) => {
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }
        res.status(200).send({
          success: true,
          message: "new wallet added successfully",
          data:{
            name: addNewWallet.name,
            _id: addNewWallet._id,
          }
        });
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

  // get Wallet by company id api
  async getWallet(req, res) {
    let { user } = req.params;

    try {
      // Find if the Wallet already exists
      const data = await Wallet.find({
        user,
      }).populate({
        path: "coupon",
        select: 'name expiry discount'// Selecting only the 'name' field
      }).populate({
        path:"company",
      select: 'name, image'});

      let availed = 0;
      data.map((val, ind)=> {
        if(val.availed == true){
          availed += 1
        }
      });

      if (data.length > 0) {
        return res.status(200).send({
          success: true,
          data: {
            message: "Wallet Found",
            Collected: data.length,
            Availed: availed,
            coupons: data,
          }
          
        });
      } else {
        return res.status(200).send({
          success: true,
          data: {
            message: "Wallet Found",
            Collected: 0,
            Availed: 0,
            coupons: [],
          }
          
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

  // get Wallet by id api
  async getWalletById(req, res) {
    let { id } = req.params;

    try {
      // Find if the Wallet already exists
      const data = await Wallet.find({
        _id: id,
      });

      if (data.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Wallet Found",
          data: data,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Wallet with this name do not exists",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        error: "Some Error Occurred",
      });
    }
  },

};

module.exports = WalletController;
