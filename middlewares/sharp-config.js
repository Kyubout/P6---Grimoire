const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const opimizedImage = async (req, res, next) => {
  if (!req.file)
    return next();

  const originalPath = req.file.path;
  const optimizedName = `optimized_${path.basename(req.file.filename)}.webp`;
  const outputPath = path.join("images", optimizedName);

  try {
    sharp.cache(false);
    await sharp(originalPath)
      .webp({ quality: 70 })
      .resize({ height: 600 })
      .toFile(outputPath)

    req.file.filename = optimizedName

    fs.unlink(originalPath, (error) => {
      if (error) {
        console.error("Erreur lors de la suppression de l'image originale: ", error);
        return next(error);
      }
      next();
    });
  } catch (error) {
    next(error);
  };
};

module.exports = opimizedImage;