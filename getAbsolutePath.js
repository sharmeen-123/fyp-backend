const express = require('express');
const path = require('path');

const folderPath = __dirname;
    const publicDirectory = path.join(folderPath, "public");


// const publicDirectory = path.join(publicPath, 'public');


const FindPathController = {
  // addFindPath api
  async addFindPath(req, res) {
    let imageName = req.params.image;
    console.log(imageName)
    if (!imageName) {
        return res.status(400).send({
          success: false,
          error: 'Image name is missing in the query parameter',
        });
      }
    
      const imagePath = path.join(publicDirectory, imageName);
    
      if (!imagePath) {
        return res.status(400).send({
          success: false,
          error: 'Image does not exist',
        });
      } else {
        res.status(200).send({
          success: true,
          path: imagePath,
        });
      }
  },



};

module.exports = FindPathController;
