let address;

$(document).ready(() => {
    var placesAutocomplete = places({
        appId: 'plMG7UTLTJ0G',
        apiKey: '658e0a072c4fa950e8b4816f9effa6f6',
        container: document.querySelector('#address-input')
    }).configure({
        countries: ['il'],
        type: 'address',
        language: 'he',
        hitsPerPage: 4
    });

    placesAutocomplete.on('change', function (e) {
        address = {
            name: e.suggestion.value,
            latlng: e.suggestion.latlng
        };
    });

    setCategories("dessertsGroup", desserts);
    setCategories("categoriesGroup", categories);

    getDetails();

});

async function getDetails() {
    let resp = await fetch('/api/conditure/getinfo');
    if (!resp.ok) {
        goToHomepage();
    } else {
        let details = await resp.json();
        details.categories = JSON.parse(details.categories);
        details.desserts = JSON.parse(details.desserts);
        details.address = JSON.parse(details.address);

        document.getElementById('email').value = details.email;
        document.getElementById('name').value = details.name;
        document.getElementById('phone').value = details.phone;
        document.getElementById('businessName').value = details.businessName;
        document.getElementById('address-input').value = details.address.name;
        address = details.address;
        document.getElementById('minPrice').value = details.minPrice;
        document.getElementById('maxPrice').value = details.maxPrice;
        document.getElementById('homepage').value = details.homepage;
        document.getElementById('maxDist').value = details.maxDist;
        document.getElementById('email').value = details.email;

        for (const checkbox of document.getElementsByTagName('input')) {
            if (checkbox.type === 'checkbox' && (details.categories.includes(checkbox.value) || details.desserts.includes(checkbox.value))) {
                checkbox.checked = true;
            }
        }
    }
}

function validateForm() {
    let formData = getFormData();
    let valid = true;

    if (formData.maxPrice < formData.minPrice) {
        document.getElementById("maxPrice").setCustomValidity("מחיר מקסימלי צריך להיות גדול יותר או שווה למחיר המינימלי");
        valid = false;
    } else {
        document.getElementById("maxPrice").setCustomValidity("");
    }

    return valid;
}

function getFormData() {
    var formData = Object.fromEntries(new FormData(document.querySelector("form")));

    formData.minPrice = parseInt(formData.minPrice);
    formData.maxPrice = parseInt(formData.maxPrice);
    formData.maxDist = parseInt(formData.maxDist);

    formData.desserts = Array.from(document.getElementById("dessertsGroup").querySelectorAll("input")).filter(e => e.checked).map(e => e.value);
    formData.categories = Array.from(document.getElementById("categoriesGroup").querySelectorAll("input")).filter(e => e.checked).map(e => e.value);

    formData.address = address;
    return formData;
}

async function submitForm() {
    event.preventDefault();

    let formData = getFormData();

    if (validateForm(formData)) {
        let response = await fetch("/api/conditure/updateInfo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            let body = await response.json();
            alert(body);
        } else {
            alert('פרטייך עודכנו!');
            location.reload();
        }

        return response.ok;
    } else {
        return false;
    }
}