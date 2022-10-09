const express = require('express');
const router = express.Router();

app.get('/github', (req, res) => {
    res.sendFile(__dirname + '/public/github.html');
});

app.post('/github/pr', async (req, res) => {
    res.send("<h1>github Received</h1>")
});

module.exports = router;