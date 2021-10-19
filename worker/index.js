const fs = require('fs');
const request = require('request');
const sharp = require("sharp");
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
dotenv.config();

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
});

const s3 = new AWS.S3();
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var queueURL = process.env.SQS_SUCCESS_URL;

var params = {
    AttributeNames: [
        "SentTimestamp"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0
};

const deleteMessage = (deleteParams) => {
    sqs.deleteMessage(deleteParams, function (err, data) {
        // if (!err) {
        //     console.log("Message Deleted", data);
        // }
    });
}

const uploadToS3 = (fileName, fileBuffer) => {
    var params = {
        Bucket: process.env.BUCKET,
        Key: `resized-${fileName}`,
        Body: fileBuffer,
        acl: 'public-read',
        Tagging: 'public=yes',
    };
    s3.upload(params, function (err, data) {
        if (!err) {
            console.log(data.key);
        }
    });
}

const resizeFn = (fileName, imageURL, resizeBy) => {
    var request = require('request').defaults({ encoding: null });
    request.get(imageURL, function (err, res, body) {
        const input = Buffer.from(body, 'binary');
        let len = parseInt(resizeBy, 10);
        sharp(input)
            .resize(len, len)
            .toBuffer((sharpError, fileBuffer) => {
                if (!sharpError) {
                    uploadToS3(fileName, fileBuffer);
                }
            })
    });
}

const receiveMessage = () => sqs.receiveMessage(params, function (err, data) {
    if (err) {
        console.log("Receive Error", err);
    } else if (data.Messages) {
        data.Messages.map((item) => {
            var deleteParams = {
                QueueUrl: queueURL,
                ReceiptHandle: item.ReceiptHandle
            };
            const { ResizeBy, FileURL, FileName } = item.MessageAttributes

            resizeFn(FileName.StringValue, FileURL.StringValue, ResizeBy.StringValue)
            deleteMessage(deleteParams);
        })
    }
});

setInterval(receiveMessage, 5000);