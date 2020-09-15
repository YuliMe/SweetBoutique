$(document).ready(() => {

    let loginData = JSON.parse(getCookie('loginData'));

    if (loginData) {
        if (loginData.isBaker) {
            $("#bakerSignupLink").remove();
        }
    }
});