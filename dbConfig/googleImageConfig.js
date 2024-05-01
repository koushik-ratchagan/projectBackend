const { Storage } = require("@google-cloud/storage");
const dotenv = require("dotenv");
dotenv.config();

const projectId = "steady-fin-421015";
const keyFileName = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const storage = new Storage({
  projectId,
  keyFileName,
});

const bucket = storage.bucket("twtcloneimages");

module.exports = bucket;
