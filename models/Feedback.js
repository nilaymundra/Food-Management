const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        //Trim used to remove white spaces form beginning and ending of a string
        trim: true
    },
    mobileNumber: {
        type: Number,
        //Add mobile number verification in the front end
        // required: [true, 'Mobile Number is required'],
        min: [1000000000, 'Enter a correct mobile number'],
        max: [9999999999, 'Enter a correct mobile number']
    },
    emailId: {
        type: String,
        // unique: [true, 'The given E-mail alreaidy exists'],
        trim: true,
        validate: {
            validator: function(input) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input);
            },
            message: "Enter a valid email"
        }
    },
    message: {
        type: String,
        trim: true
    }     
})

const Feedback = mongoose.model('feedback', FeedbackSchema);
module.exports = Feedback;