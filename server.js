const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const bodyPareser = require("body-parser");

const app = express();
app.use(bodyPareser.json());

app.use(express.json());

app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "instagram_clone",
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
    const sqlQuerry = "SELECT * FROM posts";

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

const server = app.listen(8083, () => {
  console.log("listerninng");
});
