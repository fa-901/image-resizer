const express = require("express");

const PORT = process.env.PORT || 9000;

const app = express();

app.get("/api", (req, res) => {
	res.json({ message: "Yo, this server is running!" });
});

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});