$(document).ready(function () {
    $('.hidden').animate({
        opacity: 1
    });
    $('#Footer').load("/Includes/components.html #componentFooter");
    $('#navBar').load('/Includes/components.html #componentNavBar', () => {
        let loginData = JSON.parse(getCookie('loginData'));

        if (loginData) {
            $("#loginLink").remove();

            if (loginData.isAdmin !== 1) {
                $("#adminLink").remove();
            }

            if (loginData.isBaker !== 1) {
                $("#bakerLink").remove();
            }
        } else {
            $("#logoffLink").remove();
            $("#adminLink").remove();
            $("#bakerLink").remove();
        }
    });
})