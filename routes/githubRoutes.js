const express = require('express');
const router = express.Router();
const path = require('path');
const pubFolder = path.resolve(__dirname, '../public');
const dbFolder = path.resolve(__dirname, '../db');
const db = require(dbFolder + '/rmdb.js');

//GitHub Page
router.get('/', (req, res) => {
    if (req.session.login === true) {
        res.sendFile(pubFolder + '/github.html');
    }
    else { res.redirect('/login'); }
});

//Get Repo Group Selector Data
router.get('/grps', async function (req, res) {
    if (req.session.login === true) {
        let rpoGrps = await db.getRepoGrpSel();
        res.json(rpoGrps);
    }
    else { res.redirect('/login'); }
});

//Get Repogroup data for selected repogroup
router.get('/grp', function (req, res) {
    if (req.session.login === true) {
        var parms1 = { PRrepStat: "A", selRpogrpGitOpt: "PCG_AEM", gServer: "E", prFilter: "is:pr milestone:Facet is:merged base:qa" };
        db.getRepoGrpData(parms1.selRpogrpGitOpt)
            .then(data => {
                res.json(data);
            });
    }
    else { res.redirect('/login'); }
});

router.get('/prs', async function (req, res) {
    if (req.session.login === true) {
        var parms1 = { PRrepStat: "A", selRpogrpGitOpt: "PCG_AEM", gServer: "E", prFilter: "is:pr milestone:Facet is:merged base:qa" };
        let prData = await db.getGitPRs(req.session.loginData, parms1);
        console.log("routerReturn: " + JSON.stringify(prData));
        res.json(prData);
    }
    else { res.redirect('/login'); }
});









module.exports = router;