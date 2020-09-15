async function submitForm() {
    event.preventDefault();
    let formData = new FormData(document.querySelector("form"));
    let response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(formData))
    });

    if (response.status === 401) {
        alert("שם משתמש או סיסמה אינם נכונים")
    } else {
        let body = await response.json();
        location.replace('/index.html');
    }

    return response.ok;
}

function checkLogin() {
    if (JSON.parse(getCookie('loginData'))) {
        location.replace('/index.html');
    }
}

checkLogin();