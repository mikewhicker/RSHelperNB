var appHost = window.location.origin;
var loginHost = appHost + '/login';



$(document).ready(function () {
    $("#frm-logins").attr("action", loginHost);
    $("#frm-logins").submit(function (event) {
        //event.preventDefault();
        saveLoginsLocal();
        return true;
    });
});


//localstorage login
function saveLoginsLocal() {
    let data = $("#frm-logins").serializeArray();
    console.log(data);
    let loginData = { "logins": data }; // save login form data
    localStorage.setItem('loginData', JSON.stringify(loginData));
}

function loadLoginsFrmLocal() {
    if (localStorage.getItem('loginData')) {
        let data = JSON.parse(localStorage.getItem('loginData'));
        data.logins.forEach(function (val) {
            let valKey = val.name;
            let valVal = val.value;
            $("#" + valKey).val(valVal);

        });

    }
    else alert("No Logins for You!");
}