const path = require('path');
const express = require("express");
const cors = require("cors");
const handleUploadMiddleware = require("./imageUpload");

const PORT = process.env.PORT || 9000;

const app = express();

app.use(cors())

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api", (req, res) => {
	res.json({ message: "Yo, this server is running!" });
});

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

const api_uploadFiles = (req, res) => {
	res.status(200);
	return res.json({
		msg: "Uploaded!",
		files: req.input_files
	});
}
app.post('/api/upload',
	handleUploadMiddleware.array('input_files', 6),
	api_uploadFiles
);
