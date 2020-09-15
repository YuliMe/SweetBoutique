let order = null;

async function getOrder() {
    const urlParams = new URLSearchParams(location.search);

    let orderid = urlParams.get('orderid');

    let resp = await fetch('/api/getorder/' + orderid);

    if (resp.ok) {
        order = await resp.json();
        setOrderInfo();

        if (order.isReady) {
            $('#feedback').animate({
                opacity: 1
            });
        }
    } else {
        alert('לא נמצא קונדיטור מתאים');
    }
}


$(document).ready(() => {
    getOrder();
});

function setOrderInfo() {
    document.getElementById('orderid').innerHTML = order.orderid;
    document.getElementById('timeOfOrder').innerHTML = order.timeOfOrder;
    document.getElementById('orderForDate').innerHTML = order.orderForDate;
    document.getElementById('comments').innerHTML = order.comments;
    document.getElementById('isReady').innerHTML = order.isReady ? 'מוכן' : 'בהכנה';
    if (order.feedbackRating !== null) {
        document.getElementById('feedbackRating').setAttribute('disabled', true);
        document.getElementById('feedbackComment').setAttribute('disabled', true);
        $("#sendFeedbackButton").remove();
    }

    document.getElementById('feedbackRating').value = order.feedbackRating;
    document.getElementById('feedbackComment').value = order.feedbackComment || '';
}

async function sendFeedback() {
    event.preventDefault();

    let formData = Object.fromEntries(new FormData(document.querySelector("form")));
    formData.orderId = order.orderid;

    let resp = await fetch('/api/sendfeedback', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    if (resp.ok) {
        location.reload();
    } else {
        alert('שגיאה בשליחת המשוב אנא נסה שוב במועד מאוחר יותר');
    }

    return resp.ok;
}