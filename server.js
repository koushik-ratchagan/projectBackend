const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyPareser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
app.use(bodyPareser.json());
app.use(cors());

app.use(cookieParser());
const router = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
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
app.use("/api/user", userRouter);

const server = app.listen(8083, () => {
  console.log("listerninng");
});
