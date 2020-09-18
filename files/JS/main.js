let desserts = ["עוגות ראווה",
    "עוגות מעוצבות",
    "עוגות יום הולדת",
    "שמרים ומאפים",
    "עוגות מספרים",
    "קאפקייקס",
    "קינוחים אישיים",
    "מקרונים",
    "חתונה",
    "עוגות מעוצבות לילדים",
    "מגשי אירוח",
    "עוגות ביתיות",
    "עוגות טבעוניות",
    "עוגות ללא גלוטן",
    "ימי כיף לעובדים",
    "עוגיות",
    "קינוחי כוסות",
    "מארזים לחגים ומועדים",
];

let categories = ["תעודת כשרות",
    "טבעוני",
    "ללא גלוטן",
    "ללא לקטוז",
    "משלוחים",
    "פרווה"
];

function setCategories(id, arr) {
    arr.forEach(c => {

        let element = document.createElement("div");
        let input = document.createElement("input");
        input.type = "checkbox";
        input.value = c;
        input.name = "categories";
        element.appendChild(input);

        let label = document.createElement("label");
        label.innerHTML = c;
        element.appendChild(label);

        document.getElementById(id).appendChild(element);
    });
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

function goToHomepage() {
    location.href = "/index.html";
}