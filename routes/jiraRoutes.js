const express = require('express');
const router = express.Router();

app.get('/jira', (req, res) => {
    res.sendFile(__dirname + '/public/jira.html');
});


//Jira Cloud Interface Service
app.post('/jira/issues', async (req, res) => {
    const jIssues = req.body;
    let jql = '';
    let jFixVersion = jIssues.jiraFixVersion;
    let jReleaseN = jIssues.jiraReleaseName;
    let jAuth = "Basic " + jIssues.loginEncodedJ;
    debug(jFixVersion);
    if ((jFixVersion !== undefined && jFixVersion !== null && jFixVersion != '') && (jReleaseN !== undefined && jReleaseN !== null && jReleaseN != '')) {
        jql = "fixVersion = " + jFixVersion + " OR (\"Release[Short text]\" ~ " + jReleaseN + " AND \"Release[Short text]\" is not EMPTY) order by key"

    }
    else if ((jFixVersion !== undefined && jFixVersion != null && jFixVersion != '') && (jReleaseN == undefined || jReleaseN == null || jReleaseN == '')) {
        jql = "fixVersion = " + jFixVersion + " order by key";
    }
    else if ((jFixVersion == undefined || jFixVersion == null || jFixVersion == '') && (jReleaseN !== undefined && jReleaseN != null && jReleaseN != '')) {
        jql = " \"Release[Short text]\" ~ " + jReleaseN + " AND \"Release[Short text]\" is not EMPTY order by key";
    }

    //Gets Jira Data from JiraCloudAPI
    var data = JSON.stringify({
        "validateQuery": "warn",
        //"jql": "fixVersion = " + jFixVersion + " OR \"Release[Short text]\" ~ " + jReleaseN + " order by key",
        "jql": jql,
        "fieldsByKeys": true,
        "maxResults": 500,
        "startAt": 0,
        "fields": [
            "issuetype",
            "project",
            "summary",
            "status",
            "priority",
            "fixVersions",
            "customfield_12601"
        ]
    });

    var config = {
        method: 'post',
        url: 'https://sherwin-williams.atlassian.net/rest/api/3/search',
        headers: {
            'Authorization': 'Basic TWljaGFlbC5KLldoaWNrZXJAc2hlcndpbi5jb206NTVRczZCb0pVMENOZXU2T25CTXI5QTcx',
            'Content-Type': 'application/json'
        },
        data: data
    };

    if (jql != null && jql != '') {
        await axios(config)
            .then(function (response) {
                //debug(response);
                res.send(response.data);
            })
            .catch(function (error) {
                //debug(error);
                res.send({ jiraError: error.response.data, status: error.response.status });
            });
    }
    else { res.send({ Error: "jql Error" }); }
});



module.exports = router;