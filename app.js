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
    
    availableCars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.brand;
        option.textContent = `${car.brand} (${car.category.charAt(0).toUpperCase() + car.category.slice(1)})`;
        carBrandSelect.appendChild(option);
    });
});

function fetchFuelPrice() {
    fetch('https://run.mocky.io/v3/b918f6cf-7135-4a8a-9a48-fa7ad751798f')  
        .then(response => {
            console.log('Odpowiedź:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Dane z API:', data);
            const fuelPrice = data.price;
            const fuelPriceInput = document.getElementById('fuelPrice');
            console.log('Element input:', fuelPriceInput);
            if (fuelPriceInput) {
                fuelPriceInput.value = fuelPrice.toFixed(2);
            } else {
                console.error('Nie znaleziono elementu fuelPrice w DOM');
            }
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
    const resultDiv = document.getElementById('result');
    resultDiv.classList.add('hidden'); // Ukryj wynik przed obliczeniami

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
    }, 2000);
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
    resultDiv.classList.remove('hidden'); // Pokazanie wyniku
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

 * @param {string} inputId 
 * @param {number} step 
 */
function changeValue(inputId, step) {
    const input = document.getElementById(inputId); 
    const currentValue = parseFloat(input.value) || 0; 
    let newValue = currentValue + step; 
    window.casd=input
    if (input.hasAttribute("min")) {
        const min = parseFloat(input.getAttribute("min"));
        if(currentValue < min) {
            newValue = min;
        } else if (newValue < min) {
            return; 
        }
    }

    if (input.hasAttribute("step")) {
        const stepValue = parseFloat(input.getAttribute("step"));
        input.value = (Math.round(newValue / stepValue) * stepValue).toFixed(stepValue % 1 === 0 ? 0 : 2);
    } else {
        input.value = newValue;
    }
}
const MIN_LICENSE_YEAR = 1900;
const INITIAL_LICENSE_YEAR = 1980;

function changeValue(inputId, step) {
    const input = document.getElementById(inputId);
    let currentValue;

    if (inputId === 'licenseYear') {
        currentValue = parseFloat(input.value) || INITIAL_LICENSE_YEAR;
    } else {
        currentValue = parseFloat(input.value) || 0;
    }

    let newValue = currentValue + step;

    if (input.hasAttribute("step")) {
        const stepValue = parseFloat(input.getAttribute("step"));
        newValue = Math.round(newValue / stepValue) * stepValue;
    }

    if (input.hasAttribute("min")) {
        const min = parseFloat(input.getAttribute("min"));
        if (newValue < min) {
            newValue = min;
        }
    }

    input.value = newValue.toFixed(step % 1 === 0 ? 0 : 2);
}