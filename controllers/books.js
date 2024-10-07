const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id; //car id est généré automatiquement par la base de données 
  delete bookObject._userId; //on ne fait pas confiance au client, on récupèrera celui du token

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    averageRating: bookObject.ratings[0].grade, //initialisation de la note moyenne
  });

  //sauvegarde dans la base de données
  book.save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch(error => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        //suppression de l'image précédente si modification
        const filename = book.imageUrl.split("/images/")[1];
        req.file && fs.unlink(`images/${filename}`,
          (err) => {
            if (err) console.log(err);
            else { console.log("Ancienne image supprimée !") }
          });

        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(404).json({ error })
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

exports.createRating = (req, res, next) => {
  const addedRating = {
    userId: req.auth.userId,
    grade: req.body.rating
  };

  if (addedRating.grade < 0 || addedRating > 5) {
    return res.status(400).json({ message: "La note doit être comprise entre 0 et 5" });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.ratings.find(rating => rating.userId === req.auth.userId)) {
        return res.status(400).json({ message: "Vous avez déjà noté ce livre" })
      } else {
        book.ratings.push(addedRating);
        const newAverageRating = (book.averageRating * (book.ratings.length - 1) + addedRating.grade) / book.ratings.length;
        book.averageRating = parseFloat(newAverageRating.toFixed(1));

        book.save()
          .then((book) => res.status(201).json(book))
          .catch(error => res.status(400).json({ error }));
      };
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.getBestRatings = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) //ordre décroissant
    .limit(3) //les 3 premiers de la liste
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};