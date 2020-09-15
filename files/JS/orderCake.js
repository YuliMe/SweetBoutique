let conditure = null;
let customerAddress = null;

async function getConditure() {
    const urlParams = new URLSearchParams(location.search);

    let conditureEmail = urlParams.get('email');

    let resp = await fetch('/api/getconditure/' + conditureEmail);

    if (resp.ok) {
        conditure = await resp.json();
        conditure.categories = JSON.parse(conditure.categories);
        conditure.desserts = JSON.parse(conditure.desserts);
        conditure.address = JSON.parse(conditure.address);
        setOrderInfo();
    } else {
        alert('לא נמצא קונדיטור מתאים');
    }
}


$(document).ready(() => {
    getConditure();

    var placesAutocomplete = places({
        appId: 'plMG7UTLTJ0G',
        apiKey: '658e0a072c4fa950e8b4816f9effa6f6',
        container: document.querySelector('#customerAddress')
    }).configure({
        countries: ['il'],
        type: 'address',
        language: 'he',
        hitsPerPage: 4
    });

    placesAutocomplete.on('change', function (e) {
        customerAddress = {
            name: e.suggestion.value,
            latlng: e.suggestion.latlng
        }
    });

    placesAutocomplete.on('clear', function (e) {
        customerAddress = null;
    });
});

async function orderCake() {
    event.preventDefault();
    let formData = Object.fromEntries(new FormData(document.querySelector("form")));
    formData.conditureEmail = conditure.email;
    if (customerAddress === null) {
        alert('יש לבחור כתובת');
        return false;
    } else {
        let resp = await fetch('/api/orderCake', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (resp.ok) {
            let orderId = await resp.json();
            location.replace('/includes/orderdetails.html?orderid=' + orderId)
        } else {
            alert('שגיאה בהזמנת העוגה');
        }
    }
}

function setOrderInfo() {
    document.getElementById('businessName').innerHTML = conditure.businessName;
    document.getElementById('name').innerHTML = conditure.name;
    document.getElementById('phone').innerHTML = conditure.phone;
    document.getElementById('email').innerHTML = conditure.email;
    document.getElementById('address').innerHTML = conditure.address.name;
    document.getElementById('homepage').innerHTML = conditure.homepage;
    document.getElementById('desserts').innerHTML = conditure.desserts.join();
    document.getElementById('categories').innerHTML = conditure.categories.join();
    document.getElementById('priceRange').innerHTML = conditure.maxPrice + " - " + conditure.minPrice;
}