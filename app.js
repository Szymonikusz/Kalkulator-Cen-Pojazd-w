function calculateCost() {
    // Pobieranie wartości z formularza
    const distance = parseFloat(document.getElementById('distance').value);
    const licenseYear = parseInt(document.getElementById('licenseYear').value);
    const rentalDate = document.getElementById('rentalDate').value;
    const days = parseInt(document.getElementById('days').value);
    const carCategory = document.getElementById('carCategory').value;
    const fuelPrice = parseFloat(document.getElementById('fuelPrice').value);
    const fuelConsumption = parseFloat(document.getElementById('fuelConsumption').value);
    const availableCars = parseInt(document.getElementById('availableCars').value);

    // Podstawowa walidacja
    if (!distance || !licenseYear || !rentalDate || !days || !carCategory || !fuelPrice || !fuelConsumption || !availableCars) {
        alert('Proszę wypełnić wszystkie pola.');
        return;
    }

    // Sprawdzanie, czy kierowca może wynająć samochód Premium
    const currentYear = new Date().getFullYear();
    const drivingExperience = currentYear - licenseYear;

    if (carCategory === 'premium' && drivingExperience < 3) {
        alert('Nie możesz wypożyczyć samochodu z kategorii Premium mając prawo jazdy krócej niż 3 lata.');
        return;
    }

    // Obliczanie kosztów wynajmu
    const baseDailyCost = 100; // podstawowy koszt wynajmu na dobę w złotych
    const carCategoryMultipliers = {
        basic: 1,
        standard: 1.3,
        medium: 1.6,
        premium: 2,
        luxury: 3
    };

    let totalCost = baseDailyCost * days * carCategoryMultipliers[carCategory];

    // Dodanie kosztu paliwa
    const fuelCost = (distance / 100) * fuelConsumption * fuelPrice;
    totalCost += fuelCost;

    // Zwiększenie kosztu o 15% jeśli dostępnych egzemplarzy jest mniej niż 3
    if (availableCars < 3) {
        totalCost *= 1.15;
    }

    // Zwiększenie kosztu o 20% jeśli kierowca ma prawo jazdy krócej niż 5 lat
    if (drivingExperience < 5) {
        totalCost *= 1.2;
    }

    // Obliczanie ceny netto i brutto
    const netCost = totalCost.toFixed(2);
    const grossCost = (totalCost * 1.23).toFixed(2);

    // Wyświetlanie wyniku
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `Szacunkowy koszt wynajmu netto: ${netCost} zł<br>Szacunkowy koszt wynajmu brutto: ${grossCost} zł`;
}