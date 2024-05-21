const fs = require('fs');
const multer = require('multer');
const uploadDirectory = 'uploads/';

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const csvUpload = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file)
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, `${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}_${fileName}`);
  }
});

module.exports = {
  csvUpload: multer({ storage: csvUpload }),
};

