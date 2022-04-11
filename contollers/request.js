const userModel = require('../models/Users');
const requestModel = require('../models/Requests');

const acceptRequest = async (req, res) => {
    
    try{
        const buyer = await userModel.findById(req.body.buyer_id);
        const request = await requestModel.findById(req.body.request_id);
        const seller = await userModel.findById(request.owner);
    
        await requestModel.findByIdAndUpdate(req.body.request_id, {
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
    
        await userModel.findByIdAndUpdate(seller._id, {
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
            type: req.body.type,
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