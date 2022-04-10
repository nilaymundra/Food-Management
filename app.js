const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const {OAuth2Client} = require('google-auth-library');
const Users = require('./models/Users');
const Request = require('./models/Requests');

const app = express();

dotenv.config();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
    
const url = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


app.get('/', (req, res) => {
    res.render('home.ejs');
})

const read = require('body-parser/lib/read');
const registerUser = require('./contollers/register');

app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', (req, res) => {

    let tokenId = req.body.tokenId;
    
    //Front end uses new user variable to load different pages on login
     let newUser = false;
     let user = {};

    async function verifyUser() {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID  
        });
        const payload = ticket.getPayload();
        const currentUser = await Users.findOne({
            emailId: payload.email
        })

        if (currentUser){
            user = currentUser;
        } else {
            newUser = true;

            const userNew = {
                name: payload.name,
                emailId: payload.email,
                profilePhoto: payload.picture
            }
            user = await Users.create(userNew);
        }

        user1 = user;
    }

    verifyUser().then(() => {
        res.cookie('session-token', tokenId);
        res.send(`success ${newUser}`)
    })
    .catch(console.error)
})

app.get('/register', checkAuthenticated, (req, res) => {
    let user = req.user;
    res.render('register', {user: user});
})

app.post('/register', checkAuthenticated, registerUser)

app.get('/profile', checkAuthenticated, async (req, res) => {
    const user = await Users.findOne({emailId: req.user.email});
    
    if (user.kind === 'buyer'){
        res.redirect('/buyer');
    } else if (user.kind === 'seller'){
        res.redirect('/seller');
    } else {
        res.redirect('/register')
    }
})

app.get('/buyer', checkAuthenticated, async (req, res) => {
    const user = await Users.findOne({emailId: req.user.email});
    if (user.kind === 'seller'){
        res.redirect('/seller');
    } else if (user.kind === 'buyer'){
        const allUser = await Users.find({});
        const allRequest = await Request.find({
            buyer: user._id,
            state: 'sold'
        })
        res.render('buyer', {user: user, allUser: allUser, allRequest: allRequest});
    } else {
        res.redirect('register');
    }
});
app.post('/buyer', checkAuthenticated, async (req, res) => {
    const buyer = await Users.findById(req.body.buyer_id);
    const seller = await Users.findById(req.body.seller_id);
    const request = await Request.findOne({
        owner: req.body.seller_id,
        state: 'available'
    });

    // console.log(request);

    const newReq = await Request.findOneAndUpdate({
        owner: req.body.seller_id,
        state: 'available'
    }, {
        state: 'sold',
        buyer: buyer._id
    }, {
        new: true
    });

    // console.log(newReq);

    await Users.findByIdAndUpdate(req.body.buyer_id, {
        requestAccepted: request._id
    }, {
        new: true
    });

    await Users.findByIdAndUpdate(req.body.seller_id, {
        requestActive: seller.requestActive - 1
    }, {
        new: true
    });
    
    res.redirect('/buyer')
});

app.get('/seller', checkAuthenticated, async (req, res) => {
    const user = await Users.findOne({emailId: req.user.email});
    if (user.kind === 'buyer'){
        res.redirect('/buyer');
    } else if (user.kind === 'seller'){
        const allUser = await Users.find({});
        const allRequest = await Request.find({owner: user._id})
        res.render('seller', {user: user, allUser: allUser, allRequest: allRequest});
    } else {
        res.redirect('register');
    }
});

app.post('/seller', checkAuthenticated, async(req, res) => {
    let request = {};
    try{
        const newRequest = {
            owner: req.body.owner_id,
            state: 'available'
        }
        request = await Request.create(newRequest);

        const user = await Users.findById(req.body.owner_id);
        // console.log(user);
        user.requestGenerated.push(request._id)

        await Users.findByIdAndUpdate(req.body.owner_id, {
            requestGenerated: user.requestGenerated,
            requestActive: user.requestActive + 1
        }, {
            new: true
        });
    
        res.redirect('/seller');
    } catch(err){
        console.log(err);
    }    
    
})

app.get('/logout', (req, res) => {
    user1 = '';
    res.clearCookie('session-token');
    res.redirect('/')
})

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Successfully connected to the database');
}).catch(error => {
    console.log(error);
})

function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/login')
      })

}

app.listen(PORT, () => {
    console.log('Server running successfully on port 3000');
})