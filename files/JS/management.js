async function loadApprovals() {
    let loginData = JSON.parse(getCookie('loginData'));

    if (loginData) {
        let resp = await fetch('/api/manage/getapprovals', {
            headers: {
                Authorization: "Basic " + btoa(loginData.email + ":" + loginData.password)
            }
        })
    } else {
        location.replace("/index.html");
    }
}

loadApprovals();