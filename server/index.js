const path = require('path');
const express = require("express");

const PORT = process.env.PORT || 9000;

const app = express();

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
