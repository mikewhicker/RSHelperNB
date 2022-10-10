// Requires
const express = require('express');
const debug = require('debug')('app');
const app = express();
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const store = require('better-express-store');
const oneDay = 1000 * 60 * 60 * 24;
const dbFolder = path.resolve(__dirname, './db');
console.log('DB_FOLDER: ' + dbFolder);
//const axios = require('axios');

//const sqlite3 = require('sqlite3').verbose();


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




// ** Setup API Routers **

//Server App
app.get('/', (req, res) => {
    /* if (req.body.username == myusername && req.body.password == mypassword) {
        session = req.session;
        session.userid = req.body.username;
        console.log(req.session)
        res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
    }
    else {
        res.send('Invalid username or password');
    } */
    //res.sendFile(__dirname + '/public/home.html');
});

//Home
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
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


// *** Session State ****
app.use(session({
    secret: 'release1234managers4fun',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: oneDay
    },
    // change dbPath to the path to your database file
    store: store({
        dbPath: dbFolder + '/rmdb.db',
        tableName: 'sessions',
        deleteAfterInactivityMinutes: 120 // 0 = never delete
    })
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// Execute app
app.listen(PORT, () => {
    debug(`listening on Port ${PORT}`);
});
