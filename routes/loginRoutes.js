const express = require('express');
//const session = require('express-session');
const router = express.Router();
const path = require('path');
const pubFolder = path.resolve(__dirname, '../public');




router.get('/', (req, res) => {
    console.log('GetLogin: ' + req.session);
    res.sendFile(pubFolder + '/login.html');
});

router.get('/logout', (req, res) => {
    console.log("session killed");
    req.session.destroy(function (err) {
        res.redirect('/login');
    });

});

router.post('/', (req, res) => {
    req.session.login = true;
    let loginData = {};
    loginData['git_name_cld'] = req.body.git_name_cld;
    loginData['git_token_cld'] = req.body.git_token_cld;
    loginData['git_name_ent'] = req.body.git_name_ent;
    loginData['git_token_ent'] = req.body.git_token_ent
    loginData['jira_name_cld'] = req.body.jira_name_cld;
    loginData['jira_token_cld'] = req.body.jira_token_cld
    req.session.loginData = loginData;

    /* req.session.git_name_cld = req.body.git_name_cld;
    req.session.git_token_cld = req.body.git_token_cld;
    req.session.git_name_ent = req.body.git_name_ent;
    req.session.git_token_ent = req.body.git_token_ent;
    req.session.jira_name_cld = req.body.jira_name_cld;
    req.session.jira_token_cld = req.body.jira_token_cld; */
    console.log('PostLogin: ' + req.session);
    res.redirect('/home');
});


module.exports = router;