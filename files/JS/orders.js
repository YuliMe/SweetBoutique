async function loadOrders() {

    document.getElementById('tableBody').innerHTML = '';

    let loginData = JSON.parse(getCookie('loginData'));

    if (loginData) {
        let resp = await fetch('/api/conditure/getOrders');

        if (!resp.ok) {
            goToHomepage();
        } else {
            let waitingForApproval = await resp.json();
            $('table').DataTable().clear().destroy();
            for (const order of waitingForApproval) {
                let row = $(`<tr>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${order.customerPhone}</td>
                <td>${order.customerEmail}</td>
                <td>${order.customerAddress}</td>
                <td>${order.comments}</td>
                <td>${order.timeOfOrder}</td>
                <td>${order.orderForDate}</td>
                <td><button class="btn buttons" onclick="finishOrder('${order.orderId}')">סיים הזמנה</button></td>
                </tr>`).get(0);

                document.getElementById('tableBody').appendChild(row);
            }
            $('table').DataTable({
                language: {
                    url: "/assets/files/Hebrew.json"
                }
            });
        }
    } else {
        goToHomepage();
    }
}

async function finishOrder(orderId) {
    let resp = await fetch('/api/conditure/finishOrder', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            orderId
        })
    });

    if (!resp.ok) {
        goToHomepage();
    } else {
        loadOrders();
    }
}

$(document).ready(() => {
    loadOrders();
    $('table').DataTable({
        language: {
            url: "/assets/files/Hebrew.json"
        }
    });
});