const express = require("express");
const router = express.Router();

const bookCtrl = require("../controllers/books");

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const sharp = require("../middlewares/sharp-config");

router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestRatings);
router.post("/", auth, multer, sharp, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.createRating);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, sharp, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;