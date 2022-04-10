const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    state: {
        type: String,
        required: true,
        default: 'available'
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
})

const Request = mongoose.model('request', RequestSchema);
module.exports = Request;