const Model = require("../models/model");
const path = require("path");
const fs = require("fs");

const ModelController = {
  // addModel api
  async addModel(req, res, next) {
    try {
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

        const { name, setDefault } = req.body;
        const companyId = req.body.companyId ? req.body.companyId : null;
        let ModelData;
        if (setDefault == true) {
          ModelData = {
            name,
            image: folder,
            default: setDefault,
          };
        } else {
          ModelData = {
            name,
            image: folder,
            default: setDefault,
            companyId: companyId,
          };
        }

        let model = new Model(ModelData);

        // Save the Model to the database
        model.save((error, addNewModel) => {
          if (error) {
            return res.status(404).send({
              success: false,
              error: error,
            });
          }
          res.status(200).send({
            success: true,
            message: "new model added successfully",
            data: addNewModel
          });
        });
      } else {
        res.status(500).send({
          success: false,
          error: "Error in creatimg folder",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in  function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // update model api
  async updateModel(req, res, next) {
    try {
      const folderBuffer =
        req.files.length > 0 ? req.files[0].destination : null;
      if (folderBuffer) {
        let folderDes = folderBuffer.split("\\");
        let folder = folderDes[folderDes.length - 1];

        const { name } = req.body;
        const { id } = req.params;
        const updatedModel = await Model.findOneAndUpdate(
          { _id: id },
          { image: folder, name }, // Use $each to push multiple items
          { new: true }
        );

        if (updatedModel) {
          return res.status(200).send({
            success: true,
            message: "Model updated successfully",
            data: updatedModel,
          });
        } else {
          return res.status(404).send({
            success: false,
            error: "Model not found",
          });
        }
      } else {
        res.status(500).send({
          success: false,
          error: "Error in creatimg folder",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in  function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get Model api
  async getCustomModels(req, res) {
    
    try {
      let company = req.params.company;

      // Find if the Model already exists
      const modelExists = await Model.find({
        companyId: company,
      });
      const defaultModels = await Model.find({
        default: true,
      });

      const totalModels = [ ...defaultModels,...modelExists];

      // if (totalModels.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Model Found",
          data: {
          models: totalModels,
          totalModels: totalModels.length,
          defaultModels: defaultModels.length,
          companyModels: modelExists.length,
        }

        });
      // } else {
      //   return res.status(400).send({
      //     success: false,
      //     error: "No model added yet",
      //   });
      // }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in Model function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // get All Model api
  async getdefaultModels(req, res) {
    // Find all models
    try{
      const allModels = await Model.find({
      });
    const modelExists = await Model.find({
      default: true,
    });

    if (modelExists) {
      return res.status(200).send({
        success: true,
        message: "Model Found",
        data: {
          models: modelExists,
          totalModels : allModels.length,
          companyModels : allModels.length - modelExists.length,
          defaultModels: modelExists.length

        },
      });
    } else {
      return res.status(400).send({
        success: false,
        error: "No model added yet",
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

  // delete Model api
  async deleteModel(req, res) {
    let id = req.params.id;

    try {
      const modelDeleted = await Model.findOneAndDelete({
        _id: id,
      });
      if (modelDeleted) {

        const pathh = path.join(__dirname, `../public/${modelDeleted.image}`);
        // Removing a directory
        fs.rmdir(pathh, { recursive: true }, (err) => {
          if (err) {
            console.error("Error removing directory:", err);
          } else {
            console.log("Directory removed successfully");
          }
        });
        return res.status(200).send({
          success: true,
          message: "Model Deleted Successfully",
          // data: modelExists,
        });
      } else {
        return res.status(400).send({
          success: false,
          error: "Unable to delete model",
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in function:", error);
      res.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  },
};

module.exports = ModelController;
