const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const dotenv = require("dotenv");

const bodyPareser = require("body-parser");

const app = express();
app.use(bodyPareser.json());

app.use(express.json());

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

const server = app.listen(8083, () => {
  console.log("listerninng");
});
