const Model = require("../models/model");


const ModelController = {
  // addModel api
  async addModel(req, res, next) {
    try {
        const fileBuffer = req.file ? req.file.filename : null;
        const {name, setDefault} = req.body;
        const companyId = req.body.companyId ? req.body.companyId : null;
      let ModelData;
        if(setDefault == true){
        ModelData = {
            name,
            image: fileBuffer,
            default: setDefault
        }
      }else{
        ModelData = {
          name,
          image: fileBuffer,
          default: setDefault,
          companyId : companyId
      }
      }

        let model = new Model(ModelData);

        console.log("model data", ModelData)

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
                name: addNewModel.name,
                _id: addNewModel._id,
            });
        });
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
      const fileBuffer = req.file ? req.file.filename : null;
      const {name} = req.body;
      const {id} = req.params;
      const updatedModel = await Model.findOneAndUpdate(
        { _id: id },
        { image: fileBuffer,
          name }, // Use $each to push multiple items
        { new: true }
      );

      if (updatedModel) {
        return res.status(200).send({
          success: true,
          message: "Model updated successfully",
          model: updatedModel,
        });
      } else {
        return res.status(404).send({
          success: false,
          error: "Model not found",
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
    let company = req.params.company
    

    try{
    // Find if the Model already exists
    const modelExists = await Model.find({
      companyId: company
    });

    if (modelExists.length > 0) {
        return res.status(200).send({
            success: true,
            message:"Model Found",
            data: modelExists,
          });
    }

   else{
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

   // get All Model api
   async getdefaultModels(req, res) {

    // Find all models
    const modelExists = await Model.find({
      default: true
    });

    if (modelExists.length > 0) {
        return res.status(200).send({
            success: true,
            message:"Model Found",
            data: modelExists,
          });
    }

   else{
    return res.status(400).send({
        success: false,
        error: "No model added yet",
      });
    }
  },

  // delete Model api
  async deleteModel(req, res) {
    let id = req.params.id

    try{
    const modelDeleted = await Model.findOneAndDelete({
      _id:id
    });

    if (modelDeleted) {
        return res.status(200).send({
            success: true,
            message:"Model Deleted Successfully",
            // data: modelExists,
          });
    }

   else{
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
