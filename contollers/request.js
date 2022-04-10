const userModel = require('../models/Users');
const requestModel = require('../models/Requests');

const acceptRequest = async (req, res) => {
    
    try{
        const buyer = await userModel.findById(req.body.buyer_id);
        const seller = await userModel.findById(req.body.seller_id);
        const request = await requestModel.findOne({
            owner: req.body.seller_id,
            state: 'available'
        });
    
        await requestModel.findOneAndUpdate({
            owner: req.body.seller_id,
            state: 'available'
        }, {
            state: 'sold',
            buyer: buyer._id
        }, {
            new: true
        });
    
        await userModel.findByIdAndUpdate(req.body.buyer_id, {
            requestAccepted: request._id
        }, {
            new: true
        });
    
        await userModel.findByIdAndUpdate(req.body.seller_id, {
            requestActive: seller.requestActive - 1
        }, {
            new: true
        });
        
        res.redirect('/buyer')    
    } catch (err) {
        console.log(err);
    }
}

const createRequest = async(req, res) => {
    let request = {};
    try{
        const newRequest = {
            owner: req.body.owner_id,
            state: 'available'
        }
        request = await requestModel.create(newRequest);

        const user = await userModel.findById(req.body.owner_id);
        // console.log(user);
        user.requestGenerated.push(request._id)

        await userModel.findByIdAndUpdate(req.body.owner_id, {
            requestGenerated: user.requestGenerated,
            requestActive: user.requestActive + 1
        }, {
            new: true
        });
    
        res.redirect('/seller');
    } catch(err){
        console.log(err);
    }     
}

module.exports = {acceptRequest, createRequest};