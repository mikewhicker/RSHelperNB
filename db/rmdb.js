//App Setup
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFolder = path.resolve(__dirname, '../db');
//const axios = require('axios').default;
//Server API Setup
const serverAPIs = {
    "GitGraphqlAPI": "https://github.sherwin.com/api/graphql",
    "GitRestAPI": "https://github.sherwin.com/api/v3",
    "GitGraphqlAPIc": "https://api.github.com/graphql",
    "GitRestAPIc": "https://api.github.com",
    "JiraRestAPI": "http://localhost:4000/jira"
};

//Repo Group Selector
async function getRepoGrpSel() {
    let db = new sqlite3.Database(dbFolder + '/rmdb.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log('Connected to the database.');
            return err;
        }
    });
    let dbResultSet = new Promise(function (resolve, reject) {

        let sql = `SELECT * FROM repo_grp_selector`;
        db.all(sql, [], (err, rows) => {
            if (err) { throw err; }
            resolve(rows);
        });
    });
    let repoGroup = await dbResultSet;
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Database Closed");
    });
    return repoGroup;
}

//Repo Group Data
async function getRepoGrpData(rpoGrp) {
    rpoGrp = "PCG_AEM";
    let db = new sqlite3.Database(dbFolder + '/rmdb.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log('Connected to the database.');
            return err;
        }
    });
    let dbResultSet = new Promise(function (resolve, reject) {
        let sql = `SELECT * FROM repo_groups where repo_group = ?`;
        db.all(sql, [rpoGrp], (err, rows) => {
            if (err) { throw err; }
            resolve(rows);
        });
    });
    let repoGroup = await dbResultSet;
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Datbase Closed");
    });
    return repoGroup;








    async function openDB() {

    }

    async function dbResults() {

    }

    async function dbClose() {

    }









}

//parms = PRrepStat, selRpogrpGitOpt, gServer, prFilter
async function getGitPRs(loginD, parms) {
    var repoStatus = parms.PRrepStat;
    var repoGroupVal = parms.selRpogrpGitOpt;
    var getRepoPRArray = [];
    var gitPRs = {};

    async function func1() {
        if (repoGroupVal) {
            let repoGroupData = await getRepoGrpData(repoGroupVal);
            repoGroupData.forEach(function (repo1) {
                if (repo1.repo_status == repoStatus || repoStatus == 'X') {
                    getRepoPRArray.push(repo1);
                }
            });
            await Promise.all(getRepoPRArray.map(async (repo) => {
                gitPRs[repo.repo_name] = await getGitPRs2(loginD, parms, repo);
            }));
        }
        else {
            //Data for PRs. Set using getGitPRs
            gitPRs = await getGitPRs2(loginD, parms);
        }
    }

    return func1();
}

//Github PR Integration (Get Data)
async function getGitPRs2(logins, rpogrp, rpoObj) {
    var rpoObject = rpoObj || {
        repo_group: "none", repo_owner: "none", repo_name: "none", repo_url: "none",
        repo_type: "none", repo_status: "none", repo_division: "none",
        repo_platform: "none"
    };
    var gitPRs2 = {};
    var gitServer;
    var gitServerTyp = rpoObject.repo_type;
    var prquery = rpogrp.prFilter;
    var counter = 1;
    var curHasNext = false;
    var startingCur = null;
    var fetchOptions = {};
    var getRepo = rpoObject.repo_owner + "/" + rpoObject.repo_name;
    var auth = "";
    switch (rpoObject.repo_type) {
        case 'E':
            gitServer = serverAPIs.GitGraphqlAPI;
            auth = "token " + logins.git_token_ent;
            break;
        case 'Enterprise':
            gitServer = serverAPIs.GitGraphqlAPI;
            auth = "token " + logins.git_token_ent;
            break;
        case 'C':
            gitServer = defaultData.GitGraphqlAPIc;
            auth = "token " + logins.git_token_cld;
            break;
        case 'Cloud':
            gitServer = defaultData.GitGraphqlAPIc;
            auth = "token " + logins.git_token_cld;
            break;
        case 'none':
            if (gitServerTyp == 'C' || gitServerTyp == 'Cloud') {
                gitServer = serverAPIs.GitGraphqlAPIc;
                auth = "token " + logins.git_token_cld;
            }
            else {
                gitServer = serverAPIs.GitGraphqlAPI;
                auth = "token " + logins.git_token_ent;
            }
            break;
        default:
            if (gitServerTyp == 'C' || gitServerTyp == 'Cloud') {
                gitServer = serverAPIs.GitGraphqlAPIc;
                auth = "token " + logins.git_token_cld;
            }
            else {
                gitServer = serverAPIs.GitGraphqlAPI;
                auth = "token " + logins.git_token_ent;
            }
            break;
    }

    async function getPrs() {
        fetchOptions = await getOptions(startingCur, prquery, getRepo);
        await fetch(gitServer, fetchOptions)
            .then((resp) => resp.json())
            .then(function (resp) {
                if (resp.data.search.issueCount > 0) {
                    gitPRs2[rpoObject.RepoName + "_page" + counter] = resp;
                    curHasNext = resp.data.search.pageInfo.hasNextPage;
                    endCur = resp.data.search.pageInfo.endCursor;
                    console.log('Returned getGitPrs with ' + endCur + ' : ' + counter);
                    startingCur = endCur;
                }
                if (curHasNext == true && counter >= 1) {
                    counter = counter + 1;
                    getPrs();
                }
            })
            .catch(function (err) {
                console.log('Fetch Error', err);
            })
    }

    async function getOptions(stcur, qry, rpo) {
        var startingCur = stcur || "";
        var prquery = qry || "";
        var getRepo = rpo || "";
        var endCur = "";
        //console.log(auth);
        if (counter > 1) {
            endCur = ",after:\\\"" + startingCur + "\\\"";
        }
        var options1 = {
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "authorization": auth
            },
            "body": "{\"query\":\"{search(query:\\\"" + prquery + "\\\"  ,type:ISSUE,first:100" +
                endCur + "){issueCount \\n edges{\\n cursor \\n node{\\n ... on PullRequest{\\n number \\n url \\n id\\n title\\n " +
                "author{ login }\\n baseRefName\\n headRefName\\n changedFiles\\n state\\n milestone{ title }\\n createdAt\\n " +
                " closedAt\\n labels(first:50){nodes{name}}\\n mergedBy{login}\\n mergedAt\\n repository{name " +
                "repositoryTopics(first:10){nodes{topic{name}}} }\\n " +
                "reviews(first:50 states: APPROVED){nodes{\\n author{login}\\n state\\n submittedAt\\n updatedAt}} \\n " +
                "}\\n }  \\n }\\n  pageInfo{ startCursor endCursor hasNextPage  }\\n}\\n}\\n   \"}"
        }
        //Selected Repo
        var options2 = {
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "authorization": auth
            },
            "body": "{\"query\":\"{search(query:\\\"" + prquery + " repo:" + getRepo + "\\\"  ,type:ISSUE,first:100" +
                endCur + "){issueCount \\n edges{\\n cursor \\n node{\\n ... on PullRequest{\\n number \\n url \\n id\\n title\\n " +
                "author{ login }\\n baseRefName\\n headRefName\\n changedFiles\\n state\\n milestone{ title }\\n createdAt\\n " +
                " closedAt\\n labels(first:50){nodes{name}}\\n mergedBy{login}\\n mergedAt\\n repository{name " +
                "repositoryTopics(first:10){nodes{topic{name}}} }\\n " +
                "reviews(first:50 states: APPROVED){nodes{\\n author{login}\\n state\\n submittedAt\\n updatedAt}} \\n " +
                "}\\n }  \\n }\\n  pageInfo{ startCursor endCursor hasNextPage  }\\n}\\n}\\n   \"}"
        }
        if (rpoObject.repo_owner == "none") {
            return options1;
        }
        else {
            return options2;
        }

    }

    await getPrs();
    return gitPRs2;
}


module.exports = { getRepoGrpSel, getGitPRs, getRepoGrpData };
