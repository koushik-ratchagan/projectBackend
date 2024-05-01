const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyPareser = require("body-parser");
const app = express();
app.use(bodyPareser.json());
app.use(cors());

const router = require("./routes/postRoutes");
const db = require("./dbConfig/dbConfig");

dotenv.config();

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("deb connected successfully");
  }
});

app.use("/api/posts", router);

const server = app.listen(8083, () => {
  console.log("listerninng");
});
