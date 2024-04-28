const express = require("express");
const db = require("../dbConfig/dbConfig");

const router = express.Router();

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

module.exports = router;
