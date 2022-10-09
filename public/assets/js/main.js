// ** Globals **
/// Repo Groups
var repoGrpComboSource = []; // Repo group name for select of repo groups
var repoGroups = []; // Repo groups Array from JSON file
var rpoGrpTable;
/// Login
var loginData = {}; // logins: git-name-ent, git-token-ent, git-name-cld, git-token-cld, jira-name-cld, jira-token-cld
///Defaults
var setupDefaults = {}; // setup info from github and jira
// GitHub PRs
var prRefresh = 0; // PR query refresh counter
var gitPRs = {}; //Data for PRs. Set using getGitPRs
var prJsonTableData = []; //Data for PRtable. Set using procPRjsonData
var prJsonTableData2 = []; //Data for noncompliance table.



// ** App Loading **

$(document).ready(function () {
    //Menus
    $('#home').show();
    $('#about').hide();
    $('#github').hide();
    $('#jira').hide();
    $('#mainNav a').on('click', menuToggle);
    //Login
    $('#frm-logins').submit(handleLoginSubmint);
    loadLoginsFrmCookie();

    //Github
    $('#btn-github-setup-reset').on('click', gitLoadDefaults);
    gitGetRepoGrpsJson(); //get repo groups data from json file and load repogroup selectors
    $('#btnPrclearRepoGrp').click(function () {
        $('#sel-rpogrp-2').val('');
        $('#prStatA').prop('checked', true);
        $('#prTypeE').prop('checked', true);
        $('input[name=gServer]').attr("disabled", false);
        $('input[name=PRrepStat]').attr("disabled", true);
    });
    $('#bttnGitPrRefreshDefault').on('click', prQryDefaults);
    $('#sel-rpogrp-2').on('click', function () {
        $('#prStatA').prop('checked', true);
        $('input[name=PRrepStat]').attr("disabled", false);
        $('input[name=gServer]').prop('checked', false);
        $('input[name=gServer]').attr("disabled", true);
    });
    $('#btnPrclearRepoGrp').click(); //Initialize values & view on page load
    gitLoadDefaults(); //Initialize with values on page load
    $('#bttnGetPrs').on('click', getGitPRs);
    $('#bttnSelPrtbl').on('click', function () {
        selectTable('PRjsonTable');
    });


    //Jira
});

// ** Menu ** 

function menuToggle(evt) {
    switch (evt.target.id) {
        case 'mnu-home':
            $('#home').show();
            $('#about').hide();
            $('#github').hide();
            $('#jira').hide();
            break;
        case 'mnu-about':
            $('#home').hide();
            $('#about').show();
            $('#github').hide();
            $('#jira').hide();
            break;
        case 'mnu-github':
            $('#home').hide();
            $('#about').hide();
            $('#github').show();
            $('#jira').hide();
            break;
        case 'mnu-jira':
            $('#home').hide();
            $('#about').hide();
            $('#github').hide();
            $('#jira').show();
            break;
        default:
            $('#home').show();
            $('#about').hide();
            $('#github').hide();
            $('#jira').hide();
    }

}

function toggleLoader() {
    $('#container1').toggle();
    $('#loader').toggle();

}

// ** Login **

function handleLoginSubmint(event) {
    event.preventDefault(); // prevents form submission
    const data = new FormData(event.target); // create FormData object based on form
    const value = Object.fromEntries(data.entries()); // create new object with form data
    loginData = { "logins": value }; // save login form data
    Cookies.set("Logins", JSON.stringify(loginData), { expires: 30 });
    $("#btn-login-close").click(); // close login modal    
}

function loadLoginsFrmCookie() {
    let loginCookieData = JSON.parse(Cookies.get("Logins"));
    if (loginCookieData) {
        loginData.logins = loginCookieData.logins;
        $('#git-name-cld').val(loginData.logins['git-name-cld']);
        $('#git-token-cld').val(loginData.logins['git-token-cld']);
        $('#git-name-ent').val(loginData.logins['git-name-ent']);
        $('#git-token-ent').val(loginData.logins['git-token-ent']);
        $('#jira-name-cld').val(loginData.logins['jira-name-cld']);
        $('#jira-token-cld').val(loginData.logins['jira-token-cld']);
    }
}

// ** Gitub Setups**

function gitLoadDefaults() {
    //API Links
    $("#GitHubPages").val(setup.githubSetups.gitApiLinks.GitHubPages);
    $("#GitGraphqlAPIe").val(setup.githubSetups.gitApiLinks.GitGraphqlAPIe);
    $("#GitRestAPIe").val(setup.githubSetups.gitApiLinks.GitRestAPIe);
    $("#GitGraphqlAPIc").val(setup.githubSetups.gitApiLinks.GitGraphqlAPIc);
    $("#GitRestAPIc").val(setup.githubSetups.gitApiLinks.GitRestAPIc);
    //Other Setups
    $("#color-github-setup").val(setup.githubSetups.LblColor);
    $("#setupPrFilter").val(JSON.stringify(setup.githubSetups.PrSampleFilters));
}

function gitGetRepoGrpsJson() {
    let url = setup.githubSetups.gitApiLinks.GitRepoGrps;
    //console.log(url);
    const loadData = async (url) => {
        try {
            const response = await fetch(url);
            let data = await response.json();
            repoGroups = data;
            let allRepoGroups = data.map(function (repo) {
                return repo.Group;
            });

            repoGrpComboSource = [...new Set(allRepoGroups)];
            loadSelectOptions('.selectRepoGroup', repoGrpComboSource); //loads all RepoGroup selectors
        } catch (err) {
            console.warn(err);
        }
    };
    loadData(url);
}

function gitRepoGrpsUrlFormatter(value) {
    return '<a href="' + value + '">' + value + '</a> ';
}

// ** GitHub Pull Requests **

//Github PR Integration (Control)
async function getGitPRs() {
    let getRepoPRArray = [];
    let repoStatus = $('input[name="PRrepStat"]:checked').val();
    let repoGroupVal = $('#sel-rpogrp-2').val();
    //Pre-Procesing
    toggleLoader();
    // Process
    //A RepoGroup is Selected
    if (repoGroupVal) {
        repoGroups.forEach(function (repo1) {
            if ((repo1.Group == repoGroupVal) && (repo1.Status == repoStatus || repoStatus == 'X')) {
                getRepoPRArray.push({ Owner: repo1.Owner, RepoName: repo1.RepoName, RepoType: repo1.RepoType });
            }
        });
        for (repo in getRepoPRArray) {
            await getGitPRs2(getRepoPRArray[repo]);
        };
    }
    //No RepoGroup Selected
    else {
        await getGitPRs2();
    }
    //Post-Processing
    toggleLoader();
    //prJsonTableData.splice(0, prJsonTableData.length);

    if (Object.keys(gitPRs).length > 0) {
        procPRjsonData(gitPRs);
        prcounts = prJsonTableData.length;
        $("#prCnts").val(prcounts);
    }
    else {
        $("#prCnts").val('');
        alert("No Records Found");
    }
}

//Github PR Integration (Get Data)
async function getGitPRs2(rpoObj) {

    rpoObject = rpoObj || { Owner: "none", RepoName: "none", RepoType: "none" };
    //console.log(rpoObject);
    var gitServer;
    var gitServerTyp = $('input[name="gServer"]:checked').val();
    var prquery = $("#prFilter").val();
    var counter = 1;
    var page = {};
    var prcounts;
    var curHasNext = false;
    var startingCur = null;
    var fetchOptoions = {};
    var getRepo = rpoObject.Owner + "/" + rpoObject.RepoName;
    var auth = "";
    switch (rpoObject.RepoType) {
        case 'E':
            gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIe;
            auth = "token " + loginData.logins['git-token-ent'];
            break;
        case 'Enterprise':
            gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIe;
            auth = "token " + loginData.logins['git-token-ent'];
            break;
        case 'C':
            gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIc;
            auth = "token " + loginData.logins['git-token-cld'];
            break;
        case 'Cloud':
            gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIc;
            auth = "token " + loginData.logins['git-token-cld'];
            break;
        case 'none':
            if (gitServerTyp == 'C' || gitServerTyp == 'Cloud') {
                gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIc;
                auth = "token " + loginData.logins['git-token-cld'];
            }
            else {
                gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIe;
                auth = "token " + loginData.logins['git-token-ent'];
            }
            break;
        default:
            if (gitServerTyp == 'C' || gitServerTyp == 'Cloud') {
                gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIc;
                auth = "token " + loginData.logins['git-token-cld'];
            }
            else {
                gitServer = setup.githubSetups.gitApiLinks.GitGraphqlAPIe;
                auth = "token " + loginData.logins['git-token-ent'];
            }
            break;
    }

    do {
        fetchOptions = getOptions(startingCur, prquery, getRepo);
        await fetch(gitServer, fetchOptions)
            .then((resp) => resp.json())
            .then(function (resp) {
                if (resp.data.search.issueCount > 0) {
                    gitPRs[rpoObject.RepoName + "_page" + counter] = resp;
                    curHasNext = resp.data.search.pageInfo.hasNextPage;
                    endCur = resp.data.search.pageInfo.endCursor;
                    console.log('Returned getGitPrs with ' + endCur + ' : ' + counter);
                    startingCur = endCur;
                }
                if (curHasNext == true && counter >= 1) {
                    counter = counter + 1;
                }
            })
            .catch(function (err) {
                console.log('Fetch Error', err);
                alert(err);
                $("#prCnts").val("");
            })
    }
    while (curHasNext == true);

    function getOptions(stcur, qry, rpo) {
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
                endCur + "){issueCount \\n edges{\\n cursor \\n node{\\n ... on PullRequest{\\n number \\n id\\n title\\n " +
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
                endCur + "){issueCount \\n edges{\\n cursor \\n node{\\n ... on PullRequest{\\n number \\n id\\n title\\n " +
                "author{ login }\\n baseRefName\\n headRefName\\n changedFiles\\n state\\n milestone{ title }\\n createdAt\\n " +
                " closedAt\\n labels(first:50){nodes{name}}\\n mergedBy{login}\\n mergedAt\\n repository{name " +
                "repositoryTopics(first:10){nodes{topic{name}}} }\\n " +
                "reviews(first:50 states: APPROVED){nodes{\\n author{login}\\n state\\n submittedAt\\n updatedAt}} \\n " +
                "}\\n }  \\n }\\n  pageInfo{ startCursor endCursor hasNextPage  }\\n}\\n}\\n   \"}"
        }
        if (rpoObject.Owner == "none") {
            return options1;
        }
        else {
            return options2;
        }

    }
}

//PR Processing
function procPRjsonData(prjson) {
    let prObj = {};
    let labelsArr = [];
    let reviewerArr = [];
    let topicArr = [];
    prJsonTableData.splice(0, prJsonTableData.length); // re-initialize prJsonTableData array.
    prJsonTableData2.splice(0, prJsonTableData2.length); // re-initialize prJsonTableData2 array.
    for (let page in prjson) {
        let prvalue = prjson[page];
        let prs = prvalue.data.search.edges;
        prs.forEach(function (pr) {
            let getLabels = pr.node.labels.nodes; //array of labels
            labelsArr.splice(0, labelsArr.length);
            let labels = "";
            if (!Array.isArray(getLabels) || getLabels.length > 0) {
                getLabels.forEach(function (lbl) {
                    labelsArr.push(lbl.name);
                })
                labels = labelsArr.toString();
            }
            let getTopics = pr.node.repository.repositoryTopics.nodes; //array of topics
            topicArr.splice(0, topicArr.length);
            let topics = "";
            if (!Array.isArray(getTopics) || getTopics.length > 0) {
                getTopics.forEach(function (top) {
                    topicArr.push(top.topic.name);
                })
                topics = topicArr.toString();
            }
            let getReviewers = pr.node.reviews.nodes; //array of reviewers
            reviewerArr.splice(0, reviewerArr.length);
            let reviewers = "";
            if (!Array.isArray(getReviewers) || getReviewers.length > 0) {
                getReviewers.forEach(function (reviewer) {
                    reviewerArr.push(reviewer.author.login);
                })
                reviewers = reviewerArr.toString();
            }
            //Get Platform and Division
            prObj = getRepoGrpData(pr.node.repository.name);

            //New json object
            let prJsonTableDataObj = {};

            let compliance = 'OK';
            let compliance1 = null;
            let compliance2 = null;
            if (jiraTitleCheck(pr.node.title) === false) {
                compliance1 = 'Jira#';
            }
            if (!pr.node.milestone) {
                compliance2 = 'Milestone';
            }
            if (compliance1 && compliance2) { compliance = compliance1 + ' | ' + compliance2; }
            if (compliance1 && !compliance2) { compliance = compliance1; }
            if (!compliance1 && compliance2) { compliance = compliance2; }

            //returned values
            prJsonTableDataObj["Repository"] = pr.node.repository.name || "N/A";
            prJsonTableDataObj["Number"] = pr.node.number || "N/A";
            prJsonTableDataObj["Title"] = pr.node.title || "N/A";
            prJsonTableDataObj["RepoBase"] = pr.node.baseRefName || "N/A";
            prJsonTableDataObj["RepoHeader"] = pr.node.headRefName || "N/A";
            prJsonTableDataObj["State"] = pr.node.state || "";
            if (!pr.node.milestone) { prJsonTableDataObj["Milestone"] = ""; }
            else {
                prJsonTableDataObj["Milestone"] = pr.node.milestone.title || "N/A";
            }
            prJsonTableDataObj["Labels"] = labels || "N/A";
            prJsonTableDataObj["Topics"] = topics || "N/A";
            if (!pr.node.author) { prJsonTableDataObj["Author"] = ""; }
            else {
                prJsonTableDataObj["Author"] = pr.node.author.login || "N/A";
            }
            prJsonTableDataObj["Created"] = pr.node.createdAt || "N/A";
            prJsonTableDataObj["Merged"] = pr.node.mergedAt || "N/A";
            if (pr.node.mergedAt) {
                prJsonTableDataObj["MergeMnth"] = new Date(pr.node.mergedAt).getMonth() + 1;
            }
            else { prJsonTableDataObj["MergeMnth"] = ''; }
            if (!pr.node.mergedBy) { prJsonTableDataObj["MergedBy"] = ""; }
            else {
                prJsonTableDataObj["MergedBy"] = pr.node.mergedBy.login || "N/A";
            }
            prJsonTableDataObj["Closed"] = pr.node.closedAt || "N/A";
            prJsonTableDataObj["Files"] = pr.node.changedFiles || "N/A";
            prJsonTableDataObj["Reviewers"] = "Approvers: " + reviewers || "N/A";
            prJsonTableDataObj["JiraKeys"] = jiraIdRegex(pr.node.title);
            //From gitrepogroup
            prJsonTableDataObj["Division"] = prObj["Division"] || "N/A";
            prJsonTableDataObj["Platform"] = prObj["Platform"] || "N/A";
            prJsonTableDataObj["Status"] = prObj["Status"] || "N/A";
            prJsonTableDataObj["RepoType"] = prObj["RepoType"] || "N/A";
            prJsonTableDataObj["GitOrg"] = prObj["Owner"] || "N/A";
            prJsonTableDataObj["Group"] = prObj["Group"] || "N/A";
            prJsonTableDataObj["Compliance"] = compliance;
            //push all eletments to object
            prJsonTableData.push(prJsonTableDataObj);
        })
    }
    gitPRs = {};
    $("#prtbl").empty();
    $("#prtbl2").empty();
    prJsonTableData2 = prJsonTableData.filter(function (nc) {
        return nc.Compliance != 'OK';
    });

    createPRtable(prJsonTableData);
    createPRtable2(prJsonTableData2);
    //$("#showprtablebttn").jqxButton({ disabled: false });
    //$("#showprtablebttn2").jqxButton({ disabled: false });
}

//PR Table
function createPRtable() {
    $('#prtbl').append('<table id="PRjsonTable" class="table-responsive table-bordered"><thead><tr></tr></thead><tbody></tbody></table>');

    $.each(Object.keys(prJsonTableData[0]), function (index, key) {
        $('#PRjsonTable thead tr').append('<th>' + key + '</th>');
    });
    $.each(prJsonTableData, function (index, jsonObject) {
        if (Object.keys(jsonObject).length > 0) {
            var tableRow = '<tr>';
            $.each(Object.keys(jsonObject), function (i, key) {
                tableRow += '<td>' + jsonObject[key] + '</td>';
            });
            tableRow += "</tr>";
            $('#PRjsonTable tbody').append(tableRow);
        }
    });
}

function createPRtable2() {
    $('#prtbl2').append('<table id="PRjsonTable2"><thead><tr></tr></thead><tbody></tbody></table>');

    $.each(Object.keys(prJsonTableData[0]), function (index, key) {
        $('#PRjsonTable2 thead tr').append('<th>' + key + '</th>');
    });
    $.each(prJsonTableData2, function (index, jsonObject) {
        if (Object.keys(jsonObject).length > 0) {
            var tableRow = '<tr>';
            $.each(Object.keys(jsonObject), function (i, key) {
                tableRow += '<td>' + jsonObject[key] + '</td>';
            });
            tableRow += "</tr>";
            $('#PRjsonTable2 tbody').append(tableRow);
        }
    });
}

//PR Refreshbttn Defaults
function prQryDefaults() {
    let prFilterKeys = Object.keys(setup.githubSetups.PrSampleFilters)
    let prFilterLen = prFilterKeys.length;
    if (prRefresh < prFilterLen - 1) {
        prRefresh++;
        $('#prFilter').val(setup.githubSetups.PrSampleFilters[prFilterKeys[prRefresh]]);
    }
    else {
        $('#prFilter').val(setup.githubSetups.PrSampleFilters[prFilterKeys[0]]);
        prRefresh = 0;
    }
}


//**** Helper Functions ****

/**
 * @description Loads option data from json for a single select box
 * @param {string} target -jquery selector
 * @param {object} oJson - object from json data
 * @param {string} oClass - array of class names for options
 * @param {string} oTxtData - key from json data object used for value and text of option
 */
function loadSelectOptions(targets, oJson, oClass) {
    let selects = $(targets);
    selects.empty();
    selects.append('<option selected="true" disabled>Choose Option</option>');
    selects.prop('selectedIndex', 0);
    $.each(oJson, function (idx, opt) {
        selects.append($('<option class="form-select"></option>').attr('value', opt).addClass(oClass).text(opt));
    });
}

//Iterate over repoGroups for RepoName. Returns object with repo data.
function getRepoGrpData(reponame) {
    var obj = {};
    repoGroups.forEach(function (item, index) {
        if (item.RepoName == reponame) {
            obj = item;
        }
    })
    //console.log(obj);
    return obj;
}


//JiraId Regex - returns comma list of jira id's from text
function jiraIdRegex(prtitle) {
    findRegex = /[a-zA-Z]{2,9}-\d+/g;
    if (prtitle != null) {
        jiraKeyArray = prtitle.match(findRegex);
        if (jiraKeyArray) {
            return jiraKeyArray.toString();
        }
        else { return ''; }
    }
    else { return ''; }
}

//Compliance - Check for jira# in first postion of title
function jiraTitleCheck(prtitle) {
    checkJiraRegex = /^[a-zA-Z]{2,9}-\d+/g;
    if (prtitle != null || prtitle != '') {
        jiraValid = prtitle.match(checkJiraRegex);
        if (jiraValid) {
            return true;
        }
        else { return false; }
    }
    else { return true; }
}

function selectTable(tblId) {
    let tbl = document.getElementById(tblId);
    let range = document.createRange();
    range.selectNodeContents(tbl);
    let select = window.getSelection();
    select.removeAllRanges();
    select.addRange(range);
    alert("Use <CTRL+C> to copy selcted teble data");

}

