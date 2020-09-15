function getFormData() {
    var formData = Object.fromEntries(new FormData(document.querySelector("form")));

    formData.minPrice = parseInt(formData.minPrice);
    formData.maxPrice = parseInt(formData.maxPrice);

    formData.desserts = Array.from(document.getElementById("dessertsGroup").querySelectorAll("input")).filter(e => e.checked).map(e => e.value);
    formData.categories = Array.from(document.getElementById("categoriesGroup").querySelectorAll("input")).filter(e => e.checked).map(e => e.value);

    formData.address = address;
    return formData;
}

async function submitForm() {
    event.preventDefault();

    let formData = getFormData();

    if (validateForm(formData)) {
        let response = await fetch("/api/signup/conditure", {
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
            goToHomepage();
        }

        return response.ok;
    } else {
        return false;
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

    if (formData.password.localeCompare(formData.confPassword)) {
        document.getElementById("confPassword").setCustomValidity("הסיסמה שונה ממה שהזנת");
        valid = false;
    } else {
        document.getElementById("confPassword").setCustomValidity("");
    }

    return valid;
}

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
        }
    });

    setCategories("dessertsGroup", desserts);
    setCategories("categoriesGroup", categories);
})