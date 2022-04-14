const Feedback = require('../models/Feedback');

const postFeedback = async (req, res) => {  
    try{
        const newFeedback = { 
            name: req.body.name,
            mobileNumber: req.body.mobile,
            emailId: req.body.email,
            message: req.body.message,
        };
        await Feedback.create(newFeedback);
        
        res.redirect('/contact');
    } catch (error) {
        console.log(error);
    }
}

module.exports = {postFeedback};