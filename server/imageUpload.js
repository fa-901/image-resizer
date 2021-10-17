const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
dotenv.config();

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
});

const s3 = new aws.S3();

const isAllowedMimetype = (mime) => ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/x-ms-bmp', 'image/webp'].includes(mime.toString());
const fileFilter = (req, file, callback) => {
    const fileMime = file.mimetype;
    if (isAllowedMimetype(fileMime)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

const getUniqFileName = (originalname) => {
    const name = uuidv4();
    const ext = originalname.split('.').pop();
    return `${name}.${ext}`;
}

const handleUploadMiddleware = multer({
    fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET,
        ACL: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            console.log(file)
            const fileName = getUniqFileName(file.originalname);
            const finalPath = `${fileName}`;
            file.newName = fileName;
            cb(null, finalPath);
        }
    })
});

module.exports = handleUploadMiddleware;