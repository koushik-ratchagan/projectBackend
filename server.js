const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const bodyPareser = require("body-parser");
const multer = require("multer");
const path = require("path");
const { isValidString, checkValidPassword } = require("./helpers/helpers");
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
const keyFileName = "";

const storage = new Storage({
  projectId,
  keyFileName,
});

const bucket = storage.bucket("twtcloneimages");

app.post("/postUpload", upload, (req, res) => {
  try {
    if (req.file) {
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();

      blobStream.on("error", (err) => {
        res.status(500).send(`Error uploading file to Cloud Storage : ${err}`);
      });

      blobStream.on("finish", () => {
        res.status(200).send("success");
      });

      blobStream.end(req.file.buffer);
    }
  } catch (err) {
    return res.json({ status: "failed", message: err });
  }

  // const image = req?.file?.filename;
  // const { user_id, post_description } = req.body;
  // const sql =
  //   "INSERT INTO Posts (user_id, post_description, post_Image) VALUES (?, ?, ?)";
  // try {
  //   db.query(sql, [user_id, post_description, image], async (err, data) => {
  //     if (err) {
  //       return res.json({ status: "failure", message: err });
  //     } else if (data) {
  //       return res.json({
  //         status: "success",
  //         message: "post has been added",
  //       });
  //     }
  //   });
  // } catch (err) {
  //   return res.json({ status: "failed", message: err });
  // }
});

const server = app.listen(8083, () => {
  console.log("listerninng");
});
