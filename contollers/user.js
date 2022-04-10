const userModel = require('../models/Users');
const requestModel = require('../models/Requests');

const getBuyer = async (req, res) => {
    const user = await userModel.findOne({emailId: req.user.email});
    if (user.kind === 'seller'){
        res.redirect('/seller');
    } else if (user.kind === 'buyer'){
        const allUser = await userModel.find({});
        const allRequest = await requestModel.find({
            buyer: user._id,
            state: 'sold'
        })
        res.render('buyer', {user: user, allUser: allUser, allRequest: allRequest});
    } else {
        res.redirect('register');
    }
}

const getSeller = async (req, res) => {
    const user = await userModel.findOne({emailId: req.user.email});
    if (user.kind === 'buyer'){
        res.redirect('/buyer');
    } else if (user.kind === 'seller'){
        const allUser = await userModel.find({});
        const allRequest = await requestModel.find({owner: user._id})
        res.render('seller', {user: user, allUser: allUser, allRequest: allRequest});
    } else {
        res.redirect('register');
    }
}



module.exports = {getBuyer, getSeller}