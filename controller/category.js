const Category = require("../models/category");


const CategoryController = {
  // addCategory api
  async addCategory(req, res) {
    let CategoryData = req.body;
    let category = new Category(CategoryData);


    // Find if the Category already exists
    const categoryExists = await Category.findOne({
      name: category.name,
    });

    if (categoryExists) {
      return res.status(400).send({
        success: false,
        error: "Category with this name already exists",
      });
    }

    // Save the Category to the database
    category.save((error, addNewCategory) => {
      if (error) {
        return res.status(500).send({
          success: false,
          error: error.message,
        });
      }
      res.status(200).send({
        success: true,
        message:"new category added successfully",
        name: addNewCategory.name,
        _id: addNewCategory._id,
      });
    });
  },

   // get Category api
   async getCategory(req, res) {
    let {name} = req.body;
    console.log(name)
    

    // Find if the Category already exists
    const categoryExists = await Category.find({
      
    });

    if (categoryExists.length > 0) {
      const data = []
      categoryExists.map((val, ind) => {
        if (ind == 0){
          data.push({
            name:val.name,
            _id : val._id,
            selected: true
          })
        }else{
          data.push({
            name:val.name,
            _id : val._id,
            selected: false
          })
        }
      })
        return res.status(200).send({
            success: true,
            message:"Category Found",
            data: data,
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "Category with this name do not exists",
      });
    }
  },

};

module.exports = CategoryController;
