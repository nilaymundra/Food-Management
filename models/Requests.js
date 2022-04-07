const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    kind: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

const Request = mongoose.model('request', RequestSchema);
module.exports = Request;