const express = require('express');
const router = express.Router();
const path = require('path');
const pubFolder = path.resolve(__dirname, '../public');



router.get('/', (req, res) => {
    res.sendFile(pubFolder + '/login.html');
});

router.post('/login/api', async (req, res) => {
    res.send("<h1>Login Received</h1>")
});





module.exports = router;