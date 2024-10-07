const express = require("express");
const router = express.Router();

const bookCtrl = require("../controllers/books");

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");

router.post("/", auth, multer, bookCtrl.createBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBooks);

router.post("/:id/rating", auth, bookCtrl.createRating);
router.get("/bestrating", bookCtrl.getBestRatings);

module.exports = router;