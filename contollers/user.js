const userModel = require('../models/Users');
const requestModel = require('../models/Requests');

const getBuyer = async (req, res) => {
    const user = await userModel.findOne({emailId: req.user.email});
    if (user.kind === 'seller'){
        res.redirect('/seller');
    } else if (user.kind === 'buyer'){
        let requests = [];
        const allUser = await userModel.find({});
        const allRequest = await requestModel.find({
            buyer: user._id,
            state: 'sold'
        })

        for (const i in allRequest) {
            const seller = await userModel.findById(allRequest[i].owner);

            requests.push({request: allRequest[i], seller: seller});
        }
        res.render('buyer', {user: user, allUser: allUser, requests: requests, loggedIn: true});
    } else {
        res.redirect('register');
    }
}

const getSeller = async (req, res) => {
    const user = await userModel.findOne({emailId: req.user.email});
    if (user.kind === 'buyer'){
        res.redirect('/buyer');
    } else if (user.kind === 'seller'){
        const req = [];
        const allUser = await userModel.find({});
        const acceptReq = await requestModel.find({
            owner: user._id,
            state: 'sold'
        });
        const pendingReq = await requestModel.find({
            owner: user._id,
            state: 'available'
        })
        for (const i in acceptReq) {
            const buyer = await userModel.findById(acceptReq[i].buyer);

            req.push({request: acceptReq[i], buyer: buyer});

        }
        res.render('seller', {user: user, allUser: allUser, acceptReq: req, pendingReq: pendingReq, loggedIn: true});
    } else {
        res.redirect('register');
    }
}

const getSingleSeller = async (req, res) => {
    const id = req.params.id;
    const user = await userModel.findOne({emailId: req.user.email});
    const seller = await userModel.findById(id);
    const requestAll = await requestModel.find({
        owner: id,
        state: 'available'
    })

    res.render('individualSeller', {seller: seller, requests: requestAll, user_id: user._id, loggedIn: true, user: user});
}



module.exports = {getBuyer, getSeller, getSingleSeller}