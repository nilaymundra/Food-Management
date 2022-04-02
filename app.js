const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const ejs = require('ejs');

const app = express();

dotenv.config();
app.use(express.static("public"));
app.set("view engine", "ejs");

const url = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.render('home.ejs');
})

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Successfully connected to the database');
}).catch(error => {
    console.log(error);
})

app.listen(PORT, () => {
    console.log('Server running successfully on port 3000');
})