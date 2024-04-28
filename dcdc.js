const sharp = require("sharp");

app.post("/postUpload", upload, async (req, res) => {
  try {
    const image = req?.file?.originalname;
    const { user_id, post_description } = req.body;

    // Check if user_id is valid
    if (!isValidString(user_id)) {
      return res.json({
        status: "failed",
        message: "Please enter a valid user id",
      });
    }

    // Check if either image or post_description is valid
    if (!isValidString(image) && !isValidString(post_description)) {
      return res.json({
        status: "failed",
        message: "Please provide valid details",
      });
    }

    // Resize and compress image
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

    // Insert data into the database
    const sql =
      "INSERT INTO Posts (user_id, post_description, post_Image) VALUES (?, ?, ?)";
    const postDesc = isValidString(post_description) ? post_description : null;

    db.query(sql, [user_id, postDesc, dataImgBuffer], async (err, data) => {
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
                message: "Post has been added",
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
          message: "Post has been added",
        });
      }
    });
  } catch (err) {
    return res.json({ status: "failed", message: err });
  }
});
