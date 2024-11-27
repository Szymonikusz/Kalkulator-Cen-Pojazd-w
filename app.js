const VAT_RATE = 1.23; 
const baseDailyCost = 100; 
const carCategoryMultipliers = {
    basic: 1,
    standard: 1.3,
    medium: 1.6,
    premium: 2,
    luxury: 3
};

const cars = [
    { brand: 'Toyota', category: 'basic', available: 5 },
    { brand: 'Ford', category: 'standard', available: 3 },
    { brand: 'BMW', category: 'medium', available: 4 },
    { brand: 'Audi', category: 'premium', available: 2 },
    { brand: 'Mercedes', category: 'luxury', available: 1 }
];

function filterAvailableCars(cars, minAvailability) {
    return cars.filter(car => car.available > minAvailability);
}

document.addEventListener('DOMContentLoaded', () => {
    const availableCars = filterAvailableCars(cars, 0); 
    const carBrandSelect = document.getElementById('carBrand');
    
    // Dodaj dostępne samochody
    availableCars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.brand;
        option.textContent = `${car.brand} (${car.category.charAt(0).toUpperCase() + car.category.slice(1)})`;
        carBrandSelect.appendChild(option);
    });

    // Pobierz cenę paliwa z API i ustaw ją w polu
    fetchFuelPrice();
});

// Funkcja do pobrania ceny paliwa z API
function fetchFuelPrice() {
    fetch('https://run.mocky.io/v3/b05cb10b-5363-44f3-a18e-b1e6bbb9f62c')  // Zmień ten URL na adres Twojego API
        .then(response => response.json())
        .then(data => {
            // Załóżmy, że w API zwrócone są ceny paliw w obiekcie
            const fuelPrice = data.diesel; // Na przykład cena dla paliwa diesel
            document.getElementById('fuelPrice').value = fuelPrice.toFixed(2); // Ustawienie wartości w polu
        })
        .catch(error => {
            console.error('Błąd pobierania danych z API:', error);
            Swal.fire({
                icon: 'error',
                title: 'Błąd',
                text: 'Nie udało się pobrać ceny paliwa z API.'
            });
        });
}

function calculateCost() {
    const distance = parseFloat(document.getElementById('distance').value);
    const licenseYear = parseInt(document.getElementById('licenseYear').value);
    const rentalDate = document.getElementById('rentalDate').value;
    const days = parseInt(document.getElementById('days').value);
    const carBrand = document.getElementById('carBrand').value;
    const fuelPrice = parseFloat(document.getElementById('fuelPrice').value);
    const fuelConsumption = parseFloat(document.getElementById('fuelConsumption').value);

    const selectedCar = cars.find(car => car.brand === carBrand);

    if (!validateForm(distance, licenseYear, rentalDate, days, carBrand, fuelPrice, fuelConsumption, selectedCar)) {
        return;
    }

    if (!canRentPremium(licenseYear, selectedCar.category)) {
        return;
    }

    showLoadingSpinner(true);
    setTimeout(() => {
        let totalCost = calculateRentalCost(days, selectedCar.category);
        totalCost += calculateFuelCost(distance, fuelConsumption, fuelPrice);
        totalCost = applyAdditionalCharges(totalCost, selectedCar.available, licenseYear);

        displayCost(totalCost);
        showLoadingSpinner(false);
    }, 2000); // Simulating a delay for demonstration purposes
}

function validateForm(distance, licenseYear, rentalDate, days, carBrand, fuelPrice, fuelConsumption, selectedCar) {
    if (!distance || !licenseYear || !rentalDate || !days || !carBrand || !fuelPrice || !fuelConsumption || !selectedCar) {
        Swal.fire({
            icon: 'error',
            title: 'Błąd',
            text: 'Proszę wypełnić wszystkie pola.'
        });
        return false;
    }
    return true;
}

function canRentPremium(licenseYear, carCategory) {
    const currentYear = new Date().getFullYear();
    const drivingExperience = currentYear - licenseYear;

    if (carCategory === 'premium' && drivingExperience < 3) {
        Swal.fire({
            icon: 'error',
            title: 'Błąd',
            text: 'Nie możesz wypożyczyć samochodu z kategorii Premium mając prawo jazdy krócej niż 3 lata.'
        });
        return false;
    }
    return true;
}

function calculateRentalCost(days, carCategory) {
    return baseDailyCost * days * carCategoryMultipliers[carCategory];
}

function calculateFuelCost(distance, fuelConsumption, fuelPrice) {
    return (distance / 100) * fuelConsumption * fuelPrice;
}

function applyAdditionalCharges(totalCost, availableCars, licenseYear) {
    if (availableCars < 3) {
        totalCost *= 1.15;
    }

    const currentYear = new Date().getFullYear();
    const drivingExperience = currentYear - licenseYear;
    if (drivingExperience < 5) {
        totalCost *= 1.2;
    }

    return totalCost;
}

function displayCost(totalCost) {
    const netCost = totalCost.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
    const grossCost = (totalCost * VAT_RATE).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `Szacunkowy koszt wynajmu netto: <strong><u>${netCost}</u></strong><br>Szacunkowy koszt wynajmu brutto: <strong><u>${grossCost}</u></strong>`;
}

function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.style.display = 'block';
    } else {
        spinner.style.display = 'none';
    }
}

/**
 * Zmienia wartość pola liczbowego na podstawie kroku
 * @param {string} inputId - ID pola liczbowego
 * @param {number} step - Krok (wartość dodawana lub odejmowana)
 */
function changeValue(inputId, step) {
    const input = document.getElementById(inputId); // Pobierz pole na podstawie ID
    const currentValue = parseFloat(input.value) || 0; // Aktualna wartość pola (0, jeśli jest puste)
    let newValue = currentValue + step; // Nowa wartość
    window.casd=input
    // Uwzględnij minimalną wartość, jeśli pole ma `min`
    if (input.hasAttribute("min")) {
        const min = parseFloat(input.getAttribute("min"));
        if(currentValue < min) {
            newValue = min;
        } else if (newValue < min) {
            return; // Nie pozwalaj zejść poniżej minimum
        }
    }

    // Uwzględnij krok (step), jeśli pole ma atrybut `step`
    if (input.hasAttribute("step")) {
        const stepValue = parseFloat(input.getAttribute("step"));
        // Zaokrąglij do najbliższego wielokrotności `step`
        input.value = (Math.round(newValue / stepValue) * stepValue).toFixed(stepValue % 1 === 0 ? 0 : 2);
    } else {
        input.value = newValue; // Jeśli nie ma atrybutu `step`, ustaw nową wartość
    }
}
