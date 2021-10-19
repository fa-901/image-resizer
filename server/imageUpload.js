const aws = require("aws-sdk");
const multer = require("multer");
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
dotenv.config();

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
});

const s3 = new aws.S3();
var sqs = new aws.SQS({ apiVersion: '2012-11-05' });

const sendSQS = (list, resizeBy) => {
    list
        .filter((item) => item.status === 'success')
        .map((item) => {
            var params = {
                DelaySeconds: 10,
                MessageAttributes: {
                    "FileName": {
                        DataType: "String",
                        StringValue: item.file
                    },
                    "FileURL": {
                        DataType: "String",
                        StringValue: item.url
                    },
                    "ResizeBy": {
                        DataType: "Number",
                        StringValue: resizeBy
                    },
                },
                MessageBody: JSON.stringify(item),
                QueueUrl: process.env.SQS_SUCCESS_URL
            };
            sqs.sendMessage(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                } else {
                    console.log("Success", data.MessageId);
                }
            });
        })
}

const getUniqFileName = (originalname) => {
    const name = uuidv4();
    const ext = originalname.split('.').pop();
    return `${name}.${ext}`;
}

var storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

var multipleUpload = multer({ storage: storage }).array('file');


const s3upload = (req, res) => {
    let returnData = [];
    const file = req.files;
    let count = 0; /** counts all files that are uploaded */
    let afterAllUpload = (err, data, item, fileName) => {
        count++;
        if (err) {
            returnData.push({
                'file': fileName,
                'status': 'failed',
            })
        }
        else {
            returnData.push({
                'file': fileName,
                'original': item.originalname,
                'status': 'success',
                'url': data.Location,
            })
        }
        if (count === (file.length)) {
            sendSQS(returnData, req.body.resizeBy);
            return res.json({
                msg: "Uploaded!",
                fileStatus: returnData,
            });
        }
    }

    file.map((item) => {
        const newName = getUniqFileName(item.originalname);
        var params = {
            Bucket: process.env.BUCKET,
            Key: newName,
            Body: item.buffer,
            acl: 'public-read',
            Tagging: 'public=yes',
        };
        s3.upload(params, function (err, data) {
            afterAllUpload(err, data, item, newName);
        });
    });
}

module.exports = {
    multipleUpload,
    s3upload,
};
