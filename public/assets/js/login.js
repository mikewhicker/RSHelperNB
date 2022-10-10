var appHost = window.location.origin;
var loginApi = appHost + '/login/api';



$(document).ready(function () {
    $("#frm-logins").attr("action", loginApi);
    $("#frm-logins").submit(function (event) {
        //event.preventDefault();
        saveLoginsLocal();
        return true;
    });
	$("#btn-login-fill").click(function(){
		loadLoginsFrmLocal();
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