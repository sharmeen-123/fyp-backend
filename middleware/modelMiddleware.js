// uploadFile.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;
    let uploadDir2;
    const formattedDate = req .folder

    uploadDir = path.join(__dirname, `../public/${formattedDate}`);

    uploadDir2 = path.join(__dirname, `../public/${formattedDate}/textures`);

    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir);
      } catch (error) {
        console.error("Error creating directory:", error);
        // Handle the error appropriately
      }
    }
    if (!fs.existsSync(uploadDir2)) {
      try {
        fs.mkdirSync(uploadDir2);
      } catch (error) {
        console.error("Error creating directory:", error);
        // Handle the error appropriately
      }
    }
    if (
      file.originalname == "scene.bin" ||
      file.originalname == "scene.gltf" ||
      file.originalname == "license.txt"
    ) {
      cb(null, uploadDir);
    } else {
      cb(null, uploadDir2);
    }
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase();
    cb(null, fileName);
  },
});

const uploadMultipleFiles = multer({
  storage: storage,
}).array("files", 10);

module.exports = uploadMultipleFiles;
