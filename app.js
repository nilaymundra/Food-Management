const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const {OAuth2Client} = require('google-auth-library');
const Users = require('./models/Users');

const app = express();

dotenv.config();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
    
const PORT = process.env.PORT || 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const connectDB = require('./db/connect');
const {getProfile} = require('./contollers/profile');
const {registerUser} = require('./contollers/register');
const {getBuyer, getSeller, getSingleSeller} = require('./contollers/user');
const {acceptRequest, createRequest} = require('./contollers/request');
const res = require('express/lib/response');
const User = require('./models/Users');


app.route('/')
.get(checkAuthentiction, (req, res) => {
    let loginUser = true;
    if (req.user == undefined){
        loginUser = false
    }
    res.render('home.ejs', {loggedIn: loginUser});
})

app.route('/login')
.get( (req, res) => res.render('login', {loggedIn: false}))
.post((req, res) => {

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
    }

    verifyUser().then(() => {
        res.cookie('session-token', tokenId);
        res.send(`success ${newUser}`)
    })
    .catch(console.error)
})

app.route('/register')
.get(checkAuthenticated, (req, res) => res.render('register', {user: req.user, loggedIn: true}))
.post(checkAuthenticated, registerUser);

app.route('/profile').get(checkAuthenticated, getProfile)

app.route('/buyer')
.get(checkAuthenticated, getBuyer)
.post(checkAuthenticated, acceptRequest);

app.route('/buyer/:id')
.get(checkAuthenticated, getSingleSeller)

app.route('/seller')
.get(checkAuthenticated, getSeller)
.post(checkAuthenticated, createRequest);

app.route('/logout').get((req, res) => {
    res.clearCookie('session-token');
    res.redirect('/');
})

app.route('/about')
.get(checkAuthentiction, (req, res) => {
    let loginUser = true;
    if (req.user == undefined){
        loginUser = false
    }
    res.render(`about`, {loggedIn: loginUser})
})

app.route('/contact')
.get(checkAuthentiction, async (req, res) => {
    let loginUser = true;
    let user;
    if (req.user == undefined){
        loginUser = false;
        user = {};
    } else {
        user = await Users.findOne({emailId: req.user.email})
    }
    res.render(`contact`, {loggedIn: loginUser, user: user})
})
.post()

connectDB(process.env.MONGO_URI)
app.listen(PORT, () => {
    console.log('Server running successfully');
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

function checkAuthentiction(req, res, next){

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
          next();
      })

}