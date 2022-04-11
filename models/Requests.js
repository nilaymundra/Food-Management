const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Request Type i required'],
        trim: true
    },
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
    },
})

const Request = mongoose.model('request', RequestSchema);
module.exports = Request;