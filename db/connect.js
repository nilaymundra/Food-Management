const mongoose = require('mongoose')

const connectDB = (url) => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Successfully connected to the database');
    }).catch(error => {
        console.log(error);
    })
}

module.exports = connectDB