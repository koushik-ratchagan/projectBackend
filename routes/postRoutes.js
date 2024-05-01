const express = require("express");
const db = require("../dbConfig/dbConfig");

const router = express.Router();
const { postImageUpload } = require("../imageConfig/multerConfig");
const { isValidString, checkValidPassword } = require("../helpers/helpers");
const sharp = require("sharp");
const bucket = require("../dbConfig/googleImageConfig");

router.route("/").get((req, res) => {
  try {
    const sqlQuerry = "SELECT * FROM Posts";

    db.query(sqlQuerry, async (err, data) => {
      if (err) {
        return res.json({ status: "failure", message: err });
      } else if (data) {
        return res.json({ status: "success", message: data });
      }
    });
  } catch (e) {
    return res.json({ status: "failure", message: e });
  }
});

router.route("/").post(postImageUpload, async (req, res) => {
  try {
    const image = req?.file?.originalname;
    const { user_id, post_description } = req.body;

    if (!isValidString(user_id)) {
      return res.json({
        status: "failed",
        message: "please enter valid user id",
      });
    }

    if (!isValidString(image) && !isValidString(post_description)) {
      return res.json({
        status: "failed",
        message: "please give valid details",
      });
    }

    let dataImgBuffer;
    if (isValidString(image)) {
      if (req?.file) {
        const imageBuffer = req.file.buffer;
        const resizedImageBuffer = await sharp(imageBuffer)
          .resize({ width: 800 })
          .jpeg({ quality: 80 })
          .toBuffer();
        dataImgBuffer = resizedImageBuffer;
      }
    }

    const sql =
      "INSERT INTO Posts (user_id, post_description, post_Image) VALUES (?, ?, ?)";
    const postDesc = isValidString(post_description) ? post_description : null;
    const dataImg = isValidString(image) ? image : null;

    db.query(sql, [user_id, postDesc, dataImg], async (err, data) => {
      if (err) {
        return res.json({ status: "failure", message: err });
      }
      if (isValidString(image)) {
        try {
          if (req?.file) {
            const blob = bucket.file(req.file.originalname);
            const blobStream = blob.createWriteStream();

            blobStream.on("error", (err) => {
              return res
                .status(500)
                .send(`Error uploading file to Cloud Storage : ${err}`);
            });

            blobStream.on("finish", () => {
              return res.status(200).json({
                status: "success",
                message: "post has been added",
              });
            });

            blobStream.end(dataImgBuffer);
          }
        } catch (e) {
          console.log(e);
          return res.json({ status: "failure", message: e });
        }
      } else {
        return res.status(200).json({
          status: "success",
          message: "post has been added",
        });
      }
    });
  } catch (e) {
    return res.json({ status: "failed", message: err });
  }
});

module.exports = router;
