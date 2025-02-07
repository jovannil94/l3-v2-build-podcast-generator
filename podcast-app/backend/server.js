const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require("express-fileupload");
const { generatePodcast } = require('./api/audioQueries');

const app = express();
const PORT = process.env.PORT;
app.use(cors());
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post("/api/generate-podcast", generatePodcast);

app.listen(PORT, () => {
    console.log("Listening to port ", PORT);
})