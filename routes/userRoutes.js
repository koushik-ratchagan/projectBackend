const express = require("express");
const db = require("../dbConfig/dbConfig");
const router = express.Router();
const { isValidString, isArrayNonEmpty } = require("../helpers/helpers");

router.route("/createUser").post((req, res) => {
  try {
    const { userName, password, phoneNumber, dateOfBirth } = req.body;

    if (
      !(
        isValidString(userName) &&
        isValidString(password) &&
        isValidString(phoneNumber) &&
        isValidString(dateOfBirth)
      )
    ) {
      res.send({ status: "failed", message: "please enter valid details" });
    }

    const SELECT_QUERRY =
      "SELECT * FROM `usersDetails` WHERE userName = ? OR phoneNumber = ?";

    const INSERT_Querry =
      "INSERT INTO usersDetails (userName, password, phoneNumber, dateOfBirth) VALUES (?, ?, ?, ?)";

    db.query(SELECT_QUERRY, [userName, phoneNumber], async (err, data) => {
      if (err) {
        return res.json({ status: "failure", message: err });
      }

      if (data) {
        if (isArrayNonEmpty(data)) {
          return res.json({
            status: "failed",
            message: "user already exists",
          });
        } else {
          db.query(
            INSERT_Querry,
            [userName, password, phoneNumber, dateOfBirth],
            async (err, data) => {
              if (err) {
                return res.json({ status: "failure", message: err });
              }
              if (data) {
                return res.json({ status: "success", message: data });
              }
            }
          );
        }
      }
    });
  } catch (e) {
    res.json({ status: "failed", message: e });
  }
});

router.route("/loginUser").get((req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!isValidString(phoneNumber) && !isValidString(password)) {
      return res.json({
        status: "failed",
        message: "please give valid details",
      });
    }
    const SELECT_QUERRY = "SELECT * FROM `usersDetails` WHERE phoneNumber = ?";

    db.query(SELECT_QUERRY, [phoneNumber], async (err, data) => {
      if (err) {
        return res.json({ status: "failed", message: err });
      }

      if (isArrayNonEmpty(data)) {
        if (data[0]?.password === password) {
          return res.json({
            status: "success",
            message: "log in successfully ",
          });
        } else {
          return res.json({
            status: "success",
            message: "password did not  match",
          });
        }
      }
    });
  } catch (e) {
    res.json({ status: "failed", message: e });
  }
});

module.exports = router;
