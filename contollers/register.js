const Users = require('../models/Users');

const registerUser = async (req, res) => {
    console.log(req.body);
  
    try{
        const user = await Users.findOne({emailId: req.body.emailId})

        console.log(user);

        const newUser = await Users.findByIdAndUpdate(user._id, { 
            mobileNumber: req.body.mobileNumber,
                street: req.body.street,
                city: req.body.city,
                pinCode: req.body.pinCode,
                kind: req.body.kind
            }, {
            new: true
        })
        res.redirect('/profile');
    } catch (error) {
        console.log(error);
    }
}

module.exports = registerUser;