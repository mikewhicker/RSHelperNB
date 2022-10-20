var curYear = new Date().getFullYear();
var repoGrps = {};
var PRfilter = [
    "is:pr milestone:Gaiety is:merged",
    "is:pr merged:>=" + curYear + "-01-01 -merged:>" + curYear + "-01-31",
    "is:pr repo:SherwinWilliams/sw-aem-foundation-core milestone:Daffodil_Hill"
];
var prRefresh = 0;


$(document).ready(function () {
    $("#nav-github").addClass("border border-primary");
    (async () => {
        await getRepoGroups();
        selAddOpt('#sel-rpogrp-git', repoGrps, 'repo_group');
    })();
    $("#sel-rpogrp-git").on('change', function (event) {
        $('input[name="gServer"]').prop('checked', false);
        $('input[name="gServer"]').attr('disabled', true);
        $('input[name="PRrepStat"]').removeAttr('disabled');
        $('#prStatA').prop('checked', true);
    });
    $("#btnPrclearRepoGrp").on('click', function (event) {
        clearSelRpogrpGitOpt0();
    });
    prRefreshNext();
    $("#bttnGitPrRefreshDefault").on('click', function (event) {
        prRefreshNext();
    });


});

function selAddOpt(selectorId, dArry, key) {
    let options = dArry;

    options.forEach(element => {
        let option = document.createElement("option");
        option.setAttribute("value", element[key]);
        option.textContent = element[key];
        $(selectorId).append(option);
        option = null;
    });
}
async function getRepoGroups() {
    let getRepoGrps = await axios.get('/github/grps');
    repoGrps = getRepoGrps.data;
}

function clearSelRpogrpGitOpt0() {
    $("#sel-rpogrp-git-opt0 > option").removeAttr("selected");
    $("#sel-rpogrp-git :first-child").prop("selected", "selected").change();
    $("input[name='PRrepStat']").prop('checked', false).prop("disabled", "disabled");
    $("#prTypeE").prop('checked', true);
    $("input[name='gServer']").removeAttr("disabled");

}

function prRefreshNext() {
    let prfilterlen = PRfilter.length;
    if (prRefresh < prfilterlen - 1) {
        prRefresh++;
        $('#prFilter').val(PRfilter[prRefresh]);
    }
    else {
        $('#prFilter').val(PRfilter[0]);
        prRefresh = 0;
    }
}