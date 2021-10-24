const path = require('path');
const multer = require("multer");
const express = require("express");
const cors = require("cors");
// const handleUploadMiddleware = require("./imageUpload");
const uploadController = require('./imageUpload');

const PORT = process.env.PORT || 9000;

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
	cors: {
		origin: '*',
	}
});
httpServer.listen(9001);

const app = express();

app.use(cors())

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api", (req, res) => {
	res.json({ message: "Yo, this server is running!" });
});

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

app.post('/api/upload', uploadController.multipleUpload, (req, res) => { uploadController.s3upload(req, res, io)});
