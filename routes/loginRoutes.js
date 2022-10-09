const express = require('express');
const router = express.Router();

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', async (req, res) => {
    res.send("<h1>Login Received</h1>")
});

module.exports = router;