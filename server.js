const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const bodyPareser = require("body-parser");
const multer = require("multer");
const path = require("path");
const { isValidString, checkValidPassword } = require("./helpers/helpers");
const sharp = require("sharp");
const { Storage } = require("@google-cloud/storage");
const app = express();
app.use(bodyPareser.json());
app.use(express.static("uploads"));
app.use(express.json({ limit: "10mb" }));

app.use(cors());

dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("deb connected successfully");
  }
});

app.get("/posts", (req, res) => {
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 5 * 1024 * 1024 },
}).single("image");

const projectId = "steady-fin-421015";
const keyFileName = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const storage = new Storage({
  projectId,
  keyFileName,
});

const bucket = storage.bucket("twtcloneimages");

app.post("/postUpload", upload, async (req, res) => {
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
          .resize({ width: 800 }) // Resize image to a maximum width of 800 pixels
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
  } catch (err) {
    return res.json({ status: "failed", message: err });
  }
});

const server = app.listen(8083, () => {
  console.log("listerninng");
});
