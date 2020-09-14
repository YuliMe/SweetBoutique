async function submitForm() {
    event.preventDefault();

    var formData = Object.fromEntries(new FormData(document.querySelector("form")));

    formData.minPrice = parseInt(formData.minPrice);
    formData.maxPrice = parseInt(formData.maxPrice);

    formData.categories = Array.from(document.getElementById("categoriesGroup").querySelectorAll("input")).filter(e => e.checked).map(e => e.value);

    if (formChecks(formData)) {
        var response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
    }
}

function formChecks(formData) {
    let valid = true;

    if (formData.maxPrice < formData.minPrice) {
        document.getElementById("maxPrice").setCustomValidity("מחיר מקסימלי צריך להיות גדול יותר או שווה למחיר המינימלי");
        valid = false;
    }

    if (formData.password !== formData.confPassword) {
        document.getElementById("confPassword").setCustomValidity("הסיסמה שונה ממה שהזנת");
        valid = false;
    }

    return valid;
}


function setCategories() {
    let categories = ["עוגות ראווה",
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
        "תעודת כשרות",
        "טבעוני",
        "ללא גלוטן",
        "ללא לקטוז",
        "משלוחים",
        "פרווה"
    ]

    categories.forEach(c => {

        let element = document.createElement("div");
        let input = document.createElement("input");
        input.type = "checkbox";
        input.value = c;
        input.name = "categories";
        element.appendChild(input);

        let label = document.createElement("label");
        label.innerHTML = c;
        element.appendChild(label);

        document.getElementById("categoriesGroup").appendChild(element);
    });
}

setCategories();