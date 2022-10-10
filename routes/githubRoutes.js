const express = require('express');
const router = express.Router();
const app = express();
const path = require('path');
const pubFolder = path.resolve(__dirname, '../public');

router.get('/', (req, res) => {
    res.sendFile(pubFolder + '/github.html');
});

router.post('/github/pr', async (req, res) => {
    res.send("<h1>github Received</h1>")
});

module.exports = router;