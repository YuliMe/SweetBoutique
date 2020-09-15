let conditures = [];
let address = null;
async function getConditures() {

    let resp = await fetch('/api/getConditures');
    if (!resp.ok) {
        alert('קרתה תקלה בעת פנייה אל השרת, אנא נסה שוב במועד מאוחר יותר')
    } else {
        conditures = await resp.json();

        conditures.forEach(c => {
            c.categories = JSON.parse(c.categories);
            c.desserts = JSON.parse(c.desserts);
            c.address = JSON.parse(c.address);
        });
    }
}

$(document).ready(async () => {
    getConditures();
    setCategories("dessertsGroup", desserts);
    setCategories("categoriesGroup", categories);

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

    placesAutocomplete.on('clear', function (e) {
        address = null;
    });
});

function search() {
    event.preventDefault();
    let searchParams = getFormData();

    if (validateForm()) {
        document.getElementById('tableBody').innerHTML = '';
        for (const conditure of conditures.filter(c =>
                searchParams.categories.every(ad => c.categories.includes(ad)) && (
                    searchParams.desserts.length === 0 || searchParams.desserts.some(d => c.desserts.includes(d)))
            ).sort((a, b) => calculateDistance(a.address.latlng, searchParams.address.latlng) - calculateDistance(b.address.latlng, searchParams.address.latlng))) {
            let row = $(`<tr>
            <td>${conditure.email}</td>
            <td>${conditure.name}</td>
            <td>${conditure.phone}</td>
            <td>${conditure.businessName}</td>
            <td>${conditure.address.name}</td>
            <td>${conditure.maxPrice} - ${conditure.minPrice}</td>
            <td>${conditure.homepage}</td>
            <td>${conditure.desserts.join()}</td>
            <td>${conditure.categories.join()}</td>
            <td>${calculateDistance(conditure.address.latlng,searchParams.address.latlng).toFixed(2)}Km</td>
            <td><button class="btn btn-primary" onclick="order('${conditure.email}')">Match</button></td>
            </tr>`).get(0);

            document.getElementById('tableBody').appendChild(row);
        }

        $('.table').animate({
            opacity: 1
        });
        return true;
    } else {
        return false;
    }
}

function order(email) {
    location.replace('/includes/ordercake.html?email=' + email);
}

function getFormData() {
    let searchParams = {};
    searchParams.desserts = Array.from(document.getElementById("dessertsGroup").querySelectorAll("input")).filter(e => e.checked).map(e => e.value);
    searchParams.categories = Array.from(document.getElementById("categoriesGroup").querySelectorAll("input")).filter(e => e.checked).map(e => e.value);
    searchParams.address = address;
    return searchParams;
}

function validateForm() {
    let searchParams = getFormData();
    let valid = true;

    if (searchParams.address === null) {
        alert("יש לבחור כתובת");
        valid = false;
    }

    return valid;
}

var earthRadius = 6371;

function calculateDistance(posA, posB) {
    var lat = posB.lat - posA.lat; // Difference of latitude
    var lng = posB.lng - posA.lng; // Difference of longitude

    var disLat = (lat * Math.PI * earthRadius) / 180; // Vertical distance
    var disLng = (lng * Math.PI * earthRadius) / 180; // Horizontal distance

    var ret = Math.pow(disLat, 2) + Math.pow(disLng, 2);
    ret = Math.sqrt(ret); // Total distance (calculated by Pythagore: a^2 + b^2 = c^2)

    return ret;
    // Now you have the total distance in the variable ret
}