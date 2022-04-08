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
const User = require('./models/Users');
const req = require('express/lib/request');

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

app.get('/profile', checkAuthenticated, async (req,res) => {

    const user1 = req.user;
    const user = await Users.findOne({emailId: user1.email})

    const allRequest = await Request.find({});
    let reqArray = [];
    let userArray = [];

    let acceptArray = [];
    let acceptOwner = [];

    //Here forEach cannot be used as it makes a mess of the async await function
    for (const oneReq of allRequest) {
        const newUser = await Users.findById(oneReq.owner);

        if ((newUser.emailId !== user.emailId) && (newUser.kind === oneReq.kind) && oneReq.state !== "sold"){
            reqArray.push(oneReq);
            userArray.push(newUser);    
        }

        if (oneReq.state === "sold"){
            const acceptUser = await Users.findById(oneReq.buyer);
            acceptArray.push(oneReq);
            acceptOwner.push(acceptUser);
        }
    }; 

    res.render('profile', {user: user, requests: reqArray, reqUser: userArray, accepts: acceptArray, acceptUser: acceptOwner});
})
app.post('/profile', checkAuthenticated, async (req, res) => {    
    let request = {};
    try{
        const newRequest = {
            kind: req.body.kind,
            owner: req.body.owner,
            state: 'available'
        }
        request = await Request.create(newRequest);

        const user = await Users.findById(req.body.owner)
        user.requestGenerated.push(request._id)

        await User.findByIdAndUpdate(req.body.owner, {
            requestGenerated: user.requestGenerated
        }, {
            new: true
        });
    
        res.redirect('/profile');
        } catch(err){
        console.log(err);
    }
})

app.post('/accept', async (req, res) => {
    const reqAccept = await Request.findByIdAndUpdate(req.body.id, {
        state: "sold",
        buyer: req.body.user_id
    }, {
        new: true
    })
    res.redirect('/profile');
})

app.get('/logout', (req, res)=>{
    user1 = '';
    res.clearCookie('session-token');
    res.redirect('/login')
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