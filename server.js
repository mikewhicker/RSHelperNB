// Requires
const express = require('express');
const debug = require('debug')('app');
const app = express();
const cors = require('cors');
const session = require("express-session")
const oneDay = 1000 * 60 * 60 * 24;
const path = require('path');
const dbFolder = path.resolve(__dirname, './db');
const FileStore = require('session-file-store')(session);

//Other constants
const PORT = process.env.PORT || 3000;


// Setup CORS
app.use(cors());

//*** Turn off CA checking for Development Server
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Setup Static Server Middleware
app.use(express.static('public'));

// Configuring body parser middleware
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

// *** Session State ****
const fileStoreOptions = {
    path: dbFolder + "/sessions",
    ttl: oneDay,
    secret: 'releasemanager'
};
app.use(session({
    secret: 'release1234managers4fun',
    resave: false,
    saveUninitialized: false,
    store: new FileStore(fileStoreOptions),
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: oneDay
    }
}));




// ** Setup API Routers **

//Server App
app.get('/', (req, res) => {

    if (req.session) {
        console.log('AppSession: ' + req.session);
        if (req.session.login === true) {
            res.sendFile(__dirname + '/public/home.html');
        }
        else {
            res.redirect('/login');
        }
    }
    else {
        res.redirect('/login');
    }
});


//Home
app.get('/home', (req, res) => {
    if (req.session) {
        if (req.session.login === true) {
            res.sendFile(__dirname + '/public/home.html');
        }
        else {
            res.redirect('/login');
        }
    }
    else {
        res.redirect('/login');
    }
});

//Logins
const login = require('./routes/loginRoutes');
app.use('/login', login);

//Jira
const jiraRoutes = require('./routes/jiraRoutes');
app.use('/jira', jiraRoutes);


//GitHub
const githubRoutes = require('./routes/githubRoutes');
app.use('/github', githubRoutes);

// Default route
app.get("*", (req, res) => {
    res.send("YOURE REQUESTED PAGE IS NOT FOUND"); // Here user can also design an error page and render it 
});








// Execute app
app.listen(PORT, () => {
    debug(`listening on Port ${PORT}`);
});
