const userModel = require('../models/Users');

const getProfile = async (req, res) => {
    const user = await userModel.findOne({emailId: req.user.email});
    
    if (user.kind === 'buyer'){
        res.redirect('/buyer');
    } else if (user.kind === 'seller'){
        res.redirect('/seller');
    } else {
        res.redirect('/register')
    }
}

module.exports = {getProfile};