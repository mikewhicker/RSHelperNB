// Requires
const express = require('express');
const debug = require('debug')('app');
const app = express();
const cors = require('cors');
const axios = require('axios');

//Other constants
const PORT = process.env.PORT || 3000;


// Setup CORS
app.use(cors());

//*** Turn off CA checking for Development Server
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Setup Static Server Middleware
app.use(express.static('public'));

// Configuring body parser middleware
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());


// ** Setup API Routers **
//Home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

//Login
const loginRoutes = require('./routes/loginRoutes');
app.use('/login', loginRoutes);

//Jira
const jiraRoutes = require('./routes/jiraRoutes');
app.use('/jira', jiraRoutes);


//GitHub
const jiraRoutes = require('./routes/githubRoutes');
app.use('/github', gitubRoutes);









// Execute app
app.listen(PORT, () => {
    debug(`listening on Port ${PORT}`);
});


