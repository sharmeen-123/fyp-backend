const Product = require("../models/product");


const ProductController = {
  // addProduct api
  async addProduct(req, res) {
    let ProductData = req.body;
    let product = new Product(ProductData);

    console.log("product data",ProductData)

    // Save the Product to the database
    product.save((error, addNewProduct) => {
      if (error) {
        return res.status(404).send({
          success: false,
          error: error,
        });
      }
      res.status(200).send({
        success: true,
        message:"new product added successfully",
        name: addNewProduct.name,
        _id: addNewProduct._id,
      });
    });
  },

  // add images
  async uploadImages(req, res, next) {
    const productId = req.params.id;

    // Access the uploaded files as an array
    const fileBuffers = req.files ? req.files.map((file) => file.filename) : [];
    console.log(req.files);
    if (!productId) {
      return res.status(404).send({
        error: "product id cannot be empty",
        success: false,
      });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
          return res.status(404).send({
            error: "Product not found",
            success: false,
          });
        }
        
        if (product.images.length === 0) {
          // If the images3D array is empty, set it to fileBuffers
          product.images = fileBuffers;
        } else {
          // If the images3D array is not empty, push fileBuffers into it
          product.images.push(...fileBuffers);
        }
        
        const upload = await Product.findOneAndUpdate(
          { _id: productId },
          { images: product.images },
          { new: true } // Return the updated document
        );
        

      if (!upload) {
        return res.status(404).send({
          error: "product not found",
          success: false,
        });
      }

      res.status(200).json({
        data: upload,
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

   // add 3D images
   async uploadImages3D(req, res, next) {
    const productId = req.params.id;

    // Access the uploaded files as an array
    const fileBuffers = req.files ? req.files.map((file) => file.filename) : [];
    console.log(req.files);
    if (!productId) {
      return res.status(404).send({
        error: "product id cannot be empty",
        success: false,
      });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
          return res.status(404).send({
            error: "Product not found",
            success: false,
          });
        }
        
        if (product.images3D.length === 0) {
          // If the images3D array is empty, set it to fileBuffers
          product.images3D = fileBuffers;
        } else {
          // If the images3D array is not empty, push fileBuffers into it
          product.images3D.push(...fileBuffers);
        }
        
        const upload = await Product.findOneAndUpdate(
          { _id: productId },
          { images3D: product.images3D },
          { new: true } // Return the updated document
        );
        

      if (!upload) {
        return res.status(404).send({
          error: "product not found",
          success: false,
        });
      }

      res.status(200).json({
        data: upload,
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

   // get Product api
   async getProduct(req, res) {
    let category = req.params.category
    let company = req.params.company
    // let {category, company } = req;
    console.log(category, company, req.body)
    

    // Find if the Product already exists
    const productExists = await Product.find({
      category,
      company
    });

    if (productExists.length > 0) {
        return res.status(200).send({
            success: true,
            message:"Product Found",
            data: productExists,
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "No product added yet",
      });
    }
  },

   // get All Product api
   async getAllProducts(req, res) {

    // Find all products
    const productExists = await Product.find({
      
    });

    if (productExists.length > 0) {
        return res.status(200).send({
            success: true,
            message:"Product Found",
            data: productExists,
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "No product added yet",
      });
    }
  },

  // get All Product api
  async getProductById(req, res) {

      let {product} = req.params;
    // Find all products
    const productExists = await Product.find({
      _id: product
    });

    if (productExists.length > 0) {
        return res.status(200).send({
            success: true,
            message:"Product Found",
            data: productExists,
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "Product Not Found",
      });
    }
  },

  // get Product api
  async totalCompanyProduct(req, res) {
    let company = req.params.company
    
    const productExists = await Product.find({
     
      company
    });

    if (productExists) {
        return res.status(200).send({
            success: true,
            message:"Product Found",
            data:productExists.length
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "No product added yet",
      });
    }
  },

  // delete Product api
  async deleteProduct(req, res) {
    let id = req.params.id
    console.log("id is..", id)
    
    const productDeleted = await Product.findOneAndDelete({
      _id:id
    });

    if (productDeleted) {
        return res.status(200).send({
            success: true,
            message:"Product Deleted Successfully",
            // data: productExists,
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "Unable to delete product",
      });
    }
  },

    // edit product
    async editProduct(req, res) {
        const id = req.params.id;
        const {name, category, description, price, quantity, colors, sizes, discount, images} = req.body
    
        if (!id) {
          code = 400;
          sendingData = {
            success: false,
            error: "Product ID is empty",
          };
        }
    
          const company = await Product.findOneAndUpdate(
            { _id: id },
            { name, category, 
            description, price, 
            quantity, colors, images,
            sizes, discount}
          )
            .then((res) => {
              code = 200;
              sendingData = {
                success: true,
                error: "details updated successfully",
              };
            })
            .catch((err) => {
              code = 500;
              sendingData = {
                success: false,
                error: "Some Error Occured",
              };
            });
        
        res.status(code).send({
          data: sendingData,
        });
      },

};

module.exports = ProductController;
