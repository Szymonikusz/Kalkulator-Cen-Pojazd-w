document.getElementById("seats").addEventListener("input", function () {
    document.getElementById("seatsValue").textContent = this.value;
});

document.getElementById("price").addEventListener("input", function () {
    document.getElementById("priceValue").textContent = this.value + " zł";
});

function selectClass(vehicleClass) {
    // Usuń klasę 'selected' ze wszystkich przycisków
    const buttons = document.querySelectorAll(".vehicle-class button");
    buttons.forEach(button => button.classList.remove("selected"));

    // Znajdź kliknięty przycisk i dodaj klasę 'selected'
    const selectedButton = Array.from(buttons).find(button => button.textContent === vehicleClass);
    if (selectedButton) {
        selectedButton.classList.add("selected");
        document.getElementById("vehicleClass").value = vehicleClass; // Ustaw wartość ukrytego inputa
    }
}
document.getElementById("seats").addEventListener("input", function () {
    const value = this.value;
    const max = this.max;
    const min = this.min;

    // Ustaw wartość liczby
    const seatsValue = document.getElementById("seatsValue");
    seatsValue.textContent = value;

    // Oblicz pozycję liczby nad suwakiem
    const percent = ((value - min) / (max - min)) * 100;
    const rangeWidth = this.offsetWidth;
    const thumbWidth = 20; // Rozmiar suwaka (thumb)
    const offset = thumbWidth / 2;
    const position = (percent / 100) * rangeWidth - offset;

    seatsValue.style.left = `${position}px`;

    // Ustaw gradient tła suwaka
    this.style.background = `linear-gradient(to right, #007bff ${percent}%, #e6f7ff ${percent}%)`;
});

function submitFilter(event) {
    event.preventDefault();
    const form = document.getElementById("filterForm");
    const formData = new FormData(form);
    const params = new URLSearchParams(formData).toString();
    window.location.href = `/index.html`;
}
window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has("seats")) {
        // Ustaw wartość minimalnej ilości miejsc w formularzu kalkulatora
        console.log("Przekazane dane:", Object.fromEntries(params.entries())); // Do debugu
    }
    // Podobnie wypełnij inne pola na podstawie parametrów
};
const apiUrl = "https://run.mocky.io/v3/6b601265-91ca-41c7-9db6-aa526a65fce5";

// Funkcja pobierająca dane z API
async function fetchCars() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Błąd podczas pobierania danych z API");
        const cars = await response.json();
        displayCars(cars); // Wywołanie funkcji wyświetlającej dane
    } catch (error) {
        console.error("Wystąpił błąd:", error);
    }
}

// Funkcja wyświetlająca samochody na podstawie pobranych danych
function displayCars(cars) {
    const carList = document.createElement("div");
    carList.className = "car-list";

    cars.forEach(car => {
        // Stwórz element HTML dla każdego samochodu
        const carCard = document.createElement("div");
        carCard.className = "car-card";

        // Obrazek samochodu
        const carImage = document.createElement("img");
        carImage.src = `https://path-to-your-image-hosting.com/${car.imageIdentifier}`;
        carImage.alt = car.name;

        // Informacje o samochodzie
        const carInfo = document.createElement("div");
        carInfo.className = "car-info";
        carInfo.innerHTML = `
            <h3>${car.name}</h3>
            <p><strong>Cena dzienna:</strong> ${car.dailyPriceWithVAT} zł</p>
            <p><strong>Paliwo:</strong> ${car.fuelType}</p>
            <p><strong>Skrzynia biegów:</strong> ${car.transmissionType}</p>
            <p><strong>Miejsca:</strong> ${car.seats}</p>
        `;

        // Przycisk wyboru samochodu
        const selectButton = document.createElement("button");
        selectButton.textContent = "Wybierz";
        selectButton.className = "select-btn";
        selectButton.onclick = () => selectCar(car);

        // Dodaj elementy do karty samochodu
        carCard.appendChild(carImage);
        carCard.appendChild(carInfo);
        carCard.appendChild(selectButton);

        // Dodaj kartę do listy samochodów
        carList.appendChild(carCard);
    });

    // Dodaj listę samochodów do strony
    document.body.appendChild(carList);
}

// Funkcja obsługująca wybór samochodu
function selectCar(car) {
    const params = new URLSearchParams({
        carId: car.id,
        name: car.name,
        dailyPrice: car.dailyPriceWithVAT,
        fuelType: car.fuelType,
        seats: car.seats,
        transmission: car.transmissionType,
    }).toString();

    // Przekierowanie do kalkulatora z danymi samochodu
    window.location.href = `kalkulator.html?${params}`;
}

// Wywołaj pobranie samochodów po załadowaniu strony
fetchCars();
document.querySelectorAll(".option").forEach(option => {
    option.addEventListener("click", function () {
        // Usuń zaznaczenie ze wszystkich opcji
        document.querySelectorAll(".option").forEach(opt => opt.classList.remove("selected"));
        // Dodaj zaznaczenie do klikniętej opcji
        this.classList.add("selected");
        // Zaznacz pole radio
        this.querySelector("input[type='radio']").checked = true;
    });
});