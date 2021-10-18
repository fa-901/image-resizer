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

const handleUploadMiddleware = multer({ /** old function, ignore this. doesnt support object tagging */
    fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET,
        ACL: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const fileName = getUniqFileName(file.originalname);
            const finalPath = `${fileName}`;
            file.newName = fileName;
            cb(null, finalPath);
        }
    })
});

var storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

var multipleUpload = multer({ storage: storage }).array('file');


const s3upload = (req, res) => {
    let returnData = [];
    const file = req.files;
    let count = 0;
    let afterAllUpload = (err, data, item) => {
        count++;
        if (err) {
            returnData.push({
                'file': item.originalname,
                'status': 'failed',
            })
        }
        else {
            returnData.push({
                'file': item.originalname,
                'status': 'success',
                'url': data.Location,
            })
        }
        if (count === (file.length)) {
            return res.json({
                msg: "Uploaded!",
                fileStatus: returnData,
            });
        }
    }

    file.map((item) => {
        var params = {
            Bucket: process.env.BUCKET,
            Key: (item.originalname),
            Body: item.buffer,
            acl: 'public-read',
            Tagging: 'public=yes',
        };
        s3.upload(params, function (err, data) {
            afterAllUpload(err, data, item);
        });
    });
}

module.exports = {
    multipleUpload,
    s3upload,
    handleUploadMiddleware
};
