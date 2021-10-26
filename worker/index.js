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
var queueURLFail = process.env.SQS_FAIL_URL;

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

var paramsFail = {
    AttributeNames: [
        "SentTimestamp"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: queueURLFail,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0
};

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
        origin: '*',
    }
});
httpServer.listen(9002);

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
        let obj = {
            fileName: fileName,
            resize: 'success',
            upload: 'success',
            resizedURL: data.Location,
        }
        io.emit('worker data', obj);
    });
}

const sendSQSFail = (fileName, imageURL) => {
    var params = {
        DelaySeconds: 10,
        MessageAttributes: {
            "FileName": {
                DataType: "String",
                StringValue: fileName
            },
            "FileURL": {
                DataType: "String",
                StringValue: imageURL
            },
        },
        MessageBody: 'Resize Failed',
        QueueUrl: queueURLFail
    };
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("SQS_fail: Error", err);
        } else {
            console.log("SQS_fail: Success", data.MessageId);
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
                else {
                    sendSQSFail(fileName, imageURL);
                }
            })
    }).on('error', function (err) {
        sendSQSFail(fileName, imageURL);
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

const receiveMessageFail = () => sqs.receiveMessage(paramsFail, function (err, data) {
    if (err) {
        console.log("Receive Error", err);
    } else if (data.Messages) {
        data.Messages.map((item) => {
            var deleteParams = {
                QueueUrl: queueURLFail,
                ReceiptHandle: item.ReceiptHandle
            };
            deleteMessage(deleteParams);
            let obj = {
                fileName: item.MessageAttributes?.FileName?.StringValue || '',
                resize: 'failed',
                upload: 'failed',
            }
            io.emit('worker data', obj);
        })
    }
});

setInterval(receiveMessage, 5000);
setInterval(receiveMessageFail, 5000);