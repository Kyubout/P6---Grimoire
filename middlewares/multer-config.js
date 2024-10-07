const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    //Création du dossier s'il n'existe pas
    if (!fs.existsSync("images")) {
      fs.mkdirSync("images");
    }
    callback(null, "images");
  },

  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    callback(null, name + Date.now());
  }
});

module.exports = multer({ storage: storage }).single("image");