const express = require('express');
const router = express.Router();
//const app = express();
const path = require('path');
const pubFolder = path.resolve(__dirname, '../public');
const dbFolder = path.resolve(__dirname, '../db');
const db = require(dbFolder + '/rmdb.js');
//const sqlite3 = require('sqlite3').verbose();



router.get('/', (req, res) => {
    res.sendFile(pubFolder + '/github.html');
});

router.get('/grps', function (req, res) {
    db.getRepoGrpSel().then(data => {
        res.json(data);
    });
});


router.post('/pr', (req, res) => {
    res.send("<h1>github Received</h1>");
});







module.exports = router;