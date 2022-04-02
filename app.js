const { json } = require('body-parser');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('<h1>This is a test page</h1>')
})

app.listen(PORT, () => {
    console.log('Server running successfully on port 3000');
})