const CompanyWallet = require("../models/CompanyWallet");

const CompanyWalletController = {
  // withdraw amount api
  async withdraw(req, res) {
    let CompanyWalletData = req.body;
    try {
      let companyWallet = new CompanyWallet(CompanyWalletData);

      const recievedWallet = await CompanyWallet.find({
        $or: [
          { to: companyWallet.from },
          { from: companyWallet.from }
        ]
      });
      

      let totalAmount = 0
      let withdraw = 0

      recievedWallet.map((val, ind) => {
        if(val.orderID == null){
            withdraw += val.amount
        }else{
        totalAmount += val.amount}
      })


      if (totalAmount < (withdraw + companyWallet.amount)) {
        return res.status(400).send({
          success: false,
          error: `You can withdraw maximum $ ${totalAmount - withdraw}`,
        });
      }

      // Save the CompanyWallet to the database
      companyWallet.save((error, addNewCompanyWallet) => {
        if (error) {
          return res.status(500).send({
            success: false,
            error: error.message,
          });
        }
        res.status(200).send({
          success: true,
          message: "amount withdrawn successfully",
          name: addNewCompanyWallet.name,
          _id: addNewCompanyWallet._id,
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

  // get CompanyWallet api
  async getCompanyWallet(req, res) {
    let { company } = req.params;
    try {
      // Find if the CompanyWallet already exists
      const companyWalletExists = await CompanyWallet.find({
        $or: [
          { to: company },
          { from: company }
        ]
      }).populate({
        path: "from",
        select: 'name '
      }).sort({'date':-1});

      let totalAmount = 0
      let withdraw = 0

      companyWalletExists.map((val, ind) => {
        if(val.orderID == null){
            withdraw += val.amount
        }else{
        totalAmount += val.amount}
      })
      let balance = totalAmount - withdraw

      if(balance > 1000){
        balance = balance/1000 
        balance = '$ ' + balance +" K"
      }
      else{
        balance = '$ ' + balance 
      }

      if(withdraw > 1000){
        withdraw = withdraw/1000 
        withdraw = withdraw +" K"
      }
      else{
        withdraw = '$ ' + balance 
      }

      if(totalAmount > 1000){
        totalAmount = totalAmount/1000 
        totalAmount = '$ ' + totalAmount +" K"
      }
      else{
        totalAmount = '$ ' + totalAmount
      }

      if (companyWalletExists) {
       
        return res.status(200).send({
          success: true,
          
          data: {
            message: "CompanyWallet Found",
            total: totalAmount,
            withdraw: withdraw,
            balance: balance,
            wallet: companyWalletExists
          },
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "CompanyWallet do not exists",
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

module.exports = CompanyWalletController;
