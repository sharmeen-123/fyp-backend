const Product = require("../models/product");
const fs = require("fs");
const path = require("path");

const ProductController = {
  // addProduct api
  async addProduct(req, res) {
    let ProductData = req.body;
    try {
      let product = new Product(ProductData);

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
          message: "new product added successfully",
          data: {
            name: addNewProduct.name,
            _id: addNewProduct._id,
          },
        });
      });
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // add images
  async uploadImages(req, res, next) {
    const productId = req.params.id;

    // Access the uploaded files as an array
    const fileBuffers = req.files ? req.files.map((file) => file.filename) : [];
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
      return res.status(404).send({
        error: error.response,
        success: false,
      });
    }
  },

  // add 3D images
  async uploadImages3D(req, res, next) {
    const productId = req.params.id;
    try {
      // Access the uploaded files as an array

      const folderBuffer =
        req.files.length > 0 ? req.files[0].destination : null;
      if (folderBuffer) {
        let folderDes = folderBuffer.split("\\");
        let folder = folderDes[folderDes.length - 1];
        if (folderDes[folderDes.length - 1] !== "textures") {
          folder = folderDes[folderDes.length - 1];
        } else {
          folder = folderDes[folderDes.length - 2];
        }

        if (!productId) {
          return res.status(404).send({
            error: "product id cannot be empty",
            success: false,
          });
        }

        const product = await Product.findById(productId);

        if (!product) {
          return res.status(404).send({
            error: "Product not found",
            success: false,
          });
        }

        const upload = await Product.findOneAndUpdate(
          { _id: productId },
          { images3D: folder },
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
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get Product api
  async getProduct(req, res) {
    try {
      let category = req.params.category;
      let company = req.params.company;

      // Find if the Product already exists
      const productExists = await Product.find({
        category,
        company,
      }).populate("category").populate("company").sort({ createdAt: -1 });;

      if (productExists.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Product Found",
          data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "No product added yet",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  
  // get Product api
  async getDiscountProduct(req, res) {
    try {
      // Find if the Product already exists
      const productExists = await Product.find({ discount: { $gt: 0 } }).populate("category").populate("company").sort({ createdAt: -1 });;

      if (productExists.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Product Found",
          data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "No product is available with discount",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // products without discount
   // get Product api
   async getProductWithoutDiscount(req, res) {
    try {
      // Find if the Product already exists
      const productExists = await Product.find({ discount: 0 }).populate("category").populate("company").sort({ createdAt: -1 });;

      if (productExists.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Product Found",
          data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "No product is available without discount",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get All Product api
  async getAllProducts(req, res) {
    try {
      // Find all products
      const productExists = await Product.find({}).populate("category").populate("company").sort({ createdAt: -1 });;

      if (productExists.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Product Found",
          data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "No product added yet",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get All Product api
  async getProductById(req, res) {
    let { product } = req.params;
    try {
      // Find all products
      const productExists = await Product.find({
        _id: product,
      });

      if (productExists.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Product Found",
          data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Product Not Found",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get Product api
  async totalCompanyProduct(req, res) {
    let company = req.params.company;
    try {
      const productExists = await Product.find({
        company,
      }).sort({ createdAt: -1 });

      if (productExists) {
        return res.status(200).send({
          success: true,
          message: "Product Found",
          data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "No product added yet",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // delete Product api
  async deleteProduct(req, res) {
    let id = req.params.id;
    try {
      const productDeleted = await Product.findOneAndDelete({
        _id: id,
      });

      if (productDeleted) {
        productDeleted.images.map((val, ind) => {
          const pathh = path.join(
            __dirname,
            "../public/",
            productDeleted.images[ind]
          );
          fs.unlink(pathh, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              return;
            }
          });
        });

        return res.status(200).send({
          success: true,
          message: "Product Deleted Successfully",
          // data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Unable to delete product",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // edit product
  async editProduct(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        code = 400;
        sendingData = {
          success: false,
          error: "Product ID is empty",
        };
      }
      const body = req.body;

      const company = await Product.findOneAndUpdate({ _id: id }, body)
        .then((res) => {
          code = 200;
          sendingData = {
            success: true,
            message: "details updated successfully",
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
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // add Remove to favourites
  async addRemoveFavourite(req, res) {
    try {
      const id = req.params.id;
      const user = req.body.user;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Product id is empty",
        });
      }

      // Check if the user is already in favourites
      const product = await Product.findOne({ _id: id });
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      const isUserInFavourites = product.favourites.includes(user);

      // Update the product with the given id
      let updatedProduct;
      if (isUserInFavourites) {
        updatedProduct = await Product.findOneAndUpdate(
          { _id: id },
          { $pull: { favourites: user } }, // Remove the user from favourites
          { new: true }
        );
      } else {
        updatedProduct = await Product.findOneAndUpdate(
          { _id: id },
          { $addToSet: { favourites: user } }, // Add the user to favourites
          { new: true }
        );
      }

      return res.status(200).json({
        success: true,
        message: isUserInFavourites
          ? "User removed from favourites"
          : "User added to favourites",
        data: updatedProduct,
      });
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error adding/removing user from favourites:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get Product api
  async getFavouriteProducrs(req, res) {
    let user = req.params.user;
    try {
      const productExists = await Product.find({
        favourites: { $in: [user] }
    }).sort({ createdAt: -1 });
    

      if (productExists) {
        return res.status(200).send({
          success: true,
          message: "Product Found",
          data: productExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "No product added yet",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },
};

module.exports = ProductController;
