const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//CORS
app.use(cors());

//Equivalents de bodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ROUTES
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", require("./routes/users"));
app.use("/api/books", require("./routes/books"));

module.exports = app;
