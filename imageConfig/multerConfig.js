const multer = require("multer");

const postImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 5 * 1024 * 1024 },
}).single("image");

module.exports = {
  postImageUpload,
};
