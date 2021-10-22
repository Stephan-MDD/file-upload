const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const port = 4000;
const app = express();

app.use(cors());
app.use(fileUpload());

app.post('/', async (req, res) => {
	const file = req.files.file;
	const fileName = req.body.fileName;
	// const fileExtension = req.body.fileExtension;

	console.table(req.body);

	try {
		await fs.promises.writeFile(`./files/${fileName}`, file.data);
	} catch (error) {
		console.error(error);
		return res.sendStatus(400);
	}

	res.sendStatus(200);
});

app.listen(port, () => console.log(`API Running on http://localhost:${port}`));
