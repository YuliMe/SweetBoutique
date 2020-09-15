async function loadApprovals() {

    document.getElementById('tableBody').innerHTML = '';

    let loginData = JSON.parse(getCookie('loginData'));

    if (loginData) {
        let resp = await fetch('/api/manage/getapprovals');

        if (!resp.ok) {
            goToHomepage();
        } else {
            let waitingForApproval = await resp.json();

            for (const baker of waitingForApproval) {
                let row = $(`<tr>
                <td>${baker.email}</td>
                <td>${baker.name}</td>
                <td>${baker.phone}</td>
                <td>${baker.businessName}</td>
                <td>${JSON.parse(baker.address).name}</td>
                <td>${baker.maxPrice} - ${baker.minPrice}</td>
                <td>${baker.homepage}</td>
                <td>${JSON.parse(baker.desserts).join()}</td>
                <td>${JSON.parse(baker.categories).join()}</td>
                <td><button class="btn btn-primary" onclick="approve('${baker.email}')">אשר</button></td>
                </tr>`).get(0);

                document.getElementById('tableBody').appendChild(row);
            }
        }
    } else {
        goToHomepage();
    }
}

async function approve(email) {
    let resp = await fetch('/api/manage/approve', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email
        })
    });

    if (!resp.ok) {
        goToHomepage();
    } else {
        loadApprovals();
    }
}

loadApprovals();