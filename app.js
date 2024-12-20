const VAT_RATE = 1.23;
const baseDailyCost = 100;
const carCategoryMultipliers = {
  basic: 1,
  standard: 1.3,
  medium: 1.6,
  premium: 2,
  luxury: 3,
};

const cars = [
  { brand: "Toyota", category: "basic", available: 5 },
  { brand: "Ford", category: "standard", available: 3 },
  { brand: "BMW", category: "medium", available: 4 },
  { brand: "Audi", category: "premium", available: 2 },
  { brand: "Mercedes", category: "luxury", available: 1 },
];

function filterAvailableCars(cars, minAvailability) {
  return cars.filter((car) => car.available > minAvailability);
}

document.addEventListener("DOMContentLoaded", () => {
  const availableCars = filterAvailableCars(cars, 0);
  const carBrandSelect = document.getElementById("carBrand");

  fetchFuelPrice();

  availableCars.forEach((car) => {
    const option = document.createElement("option");
    option.value = car.brand;
    option.textContent = `${car.brand} (${
      car.category.charAt(0).toUpperCase() + car.category.slice(1)
    })`;
    carBrandSelect.appendChild(option);
  });
});

function fetchFuelPrice() {
  fetch("https://run.mocky.io/v3/b918f6cf-7135-4a8a-9a48-fa7ad751798f")
    .then((response) => {
      console.log("Odpowiedź:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Dane z API:", data);
      const fuelPrice = data.price;
      const fuelPriceInput = document.getElementById("fuelPrice");
      console.log("Element input:", fuelPriceInput);
      if (fuelPriceInput) {
        fuelPriceInput.value = fuelPrice.toFixed(2);
      } else {
        console.error("Nie znaleziono elementu fuelPrice w DOM");
      }
    })
    .catch((error) => {
      console.error("Błąd pobierania danych z API:", error);
      Swal.fire({
        icon: "error",
        title: "Błąd",
        text: "Nie udało się pobrać ceny paliwa z API.",
      });
    });
}

function calculateCost() {
  const resultDiv = document.getElementById("result");
  resultDiv.classList.add("hidden"); // Ukryj wynik przed obliczeniami

  const distance = parseFloat(document.getElementById("distance").value);
  const licenseYear = parseInt(document.getElementById("licenseYear").value);
  const rentalDate = document.getElementById("rentalDate").value;
  const days = parseInt(document.getElementById("days").value);
  const carBrand = document.getElementById("carBrand").value;
  const fuelPrice = parseFloat(document.getElementById("fuelPrice").value);
  const fuelConsumption = parseFloat(
    document.getElementById("fuelConsumption").value
  );

  const selectedCar = cars.find((car) => car.brand === carBrand);

  if (
    !validateForm(
      distance,
      licenseYear,
      rentalDate,
      days,
      carBrand,
      fuelPrice,
      fuelConsumption,
      selectedCar
    )
  ) {
    return;
  }

  if (!canRentPremium(licenseYear, selectedCar.category)) {
    return;
  }

  showLoadingSpinner(true);
  setTimeout(() => {
    let totalCost = calculateRentalCost(days, selectedCar.category);
    totalCost += calculateFuelCost(distance, fuelConsumption, fuelPrice);
    totalCost = applyAdditionalCharges(
      totalCost,
      selectedCar.available,
      licenseYear
    );

    displayCost(totalCost);
    showLoadingSpinner(false);
  }, 2000);
}

function validateForm(
  distance,
  licenseYear,
  rentalDate,
  days,
  carBrand,
  fuelPrice,
  fuelConsumption,
  selectedCar
) {
  if (
    !distance ||
    !licenseYear ||
    !rentalDate ||
    !days ||
    !carBrand ||
    !fuelPrice ||
    !fuelConsumption ||
    !selectedCar
  ) {
    Swal.fire({
      icon: "error",
      title: "Błąd",
      text: "Proszę wypełnić wszystkie pola.",
    });
    return false;
  }
  return true;
}

function canRentPremium(licenseYear, carCategory) {
  const currentYear = new Date().getFullYear();
  const drivingExperience = currentYear - licenseYear;

  if (carCategory === "premium" && drivingExperience < 3) {
    Swal.fire({
      icon: "error",
      title: "Błąd",
      text: "Nie możesz wypożyczyć samochodu z kategorii Premium mając prawo jazdy krócej niż 3 lata.",
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
  const netCost = totalCost.toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
  const grossCost = (totalCost * VAT_RATE).toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `Szacunkowy koszt wynajmu netto: <strong><u>${netCost}</u></strong><br>Szacunkowy koszt wynajmu brutto: <strong><u>${grossCost}</u></strong>`;
  resultDiv.classList.remove("hidden"); // Pokazanie wyniku
}

function showLoadingSpinner(show) {
  const spinner = document.getElementById("loadingSpinner");
  if (show) {
    spinner.style.display = "block";
  } else {
    spinner.style.display = "none";
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
  window.casd = input;
  if (input.hasAttribute("min")) {
    const min = parseFloat(input.getAttribute("min"));
    if (currentValue < min) {
      newValue = min;
    } else if (newValue < min) {
      return;
    }
  }

  if (input.hasAttribute("step")) {
    const stepValue = parseFloat(input.getAttribute("step"));
    input.value = (Math.round(newValue / stepValue) * stepValue).toFixed(
      stepValue % 1 === 0 ? 0 : 2
    );
  } else {
    input.value = newValue;
  }
}
const MIN_LICENSE_YEAR = 1900;
const INITIAL_LICENSE_YEAR = 1980;

function changeValue(inputId, step) {
  const input = document.getElementById(inputId);
  let currentValue;

  if (inputId === "licenseYear") {
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

document.addEventListener("DOMContentLoaded", () => {
  const userCountElement = document.getElementById("user-count");
  const STORAGE_KEY_COUNT = "userCount"; // Klucz do liczby użytkowników
  const STORAGE_KEY_TIME = "lastRefreshTime"; // Klucz do czasu ostatniego odświeżenia

  // Funkcja do odczytu liczby użytkowników z localStorage lub ustawienia domyślnej wartości
  function getUserCount() {
    const storedValue = localStorage.getItem(STORAGE_KEY_COUNT);
    return storedValue ? parseInt(storedValue, 10) : 150; // Jeśli brak zapisanej wartości, zacznij od 150
  }

  // Funkcja do zapisania liczby użytkowników w localStorage
  function saveUserCount(count) {
    localStorage.setItem(STORAGE_KEY_COUNT, count);
  }

  // Funkcja do odczytu czasu ostatniego odświeżenia z localStorage
  function getLastRefreshTime() {
    const storedTime = localStorage.getItem(STORAGE_KEY_TIME);
    return storedTime ? parseInt(storedTime, 10) : 0; // Jeśli brak zapisu, zwróć 0
  }

  // Funkcja do zapisania czasu ostatniego odświeżenia w localStorage
  function saveLastRefreshTime() {
    localStorage.setItem(STORAGE_KEY_TIME, Date.now());
  }

  // Funkcja do obliczenia zmiany na podstawie czasu od ostatniego odświeżenia
  function calculateChange(timeElapsed) {
    if (timeElapsed < 10000) {
      // Mniej niż 10 sekund - brak zmiany
      return 0;
    } else if (timeElapsed < 30000) {
      // 10-30 sekund - losowa zmiana +1 lub +2
      return Math.floor(Math.random() * 2) + 1; // +1 lub +2
    } else if (timeElapsed < 60000) {
      // 30-60 sekund - losowa zmiana -5 do +5
      return Math.floor(Math.random() * 11) - 5; // -5 do +5
    } else {
      // Powyżej 1 minuty - losowa zmiana -15 do +15
      return Math.floor(Math.random() * 31) - 15; // -15 do +15
    }
  }

  // Funkcja do aktualizacji liczby użytkowników
  function updateUserCount() {
    const userCount = getUserCount();
    const lastRefreshTime = getLastRefreshTime();
    const timeElapsed = Date.now() - lastRefreshTime;

    // Oblicz zmianę liczby użytkowników
    let change = calculateChange(timeElapsed);

    // Jeśli liczba zbliża się do granic, zmiana jest odbijana
    if (userCount + change < 100) {
      change = Math.abs(change); // Odbij w górę
    } else if (userCount + change > 250) {
      change = -Math.abs(change); // Odbij w dół
    }

    // Zaktualizuj liczbę użytkowników
    const newUserCount = userCount + change;

    // Zapisz nową wartość i czas
    saveUserCount(newUserCount);
    saveLastRefreshTime();

    // Wyświetl nową wartość
    userCountElement.textContent = newUserCount;
  }

  // Wyświetl początkową wartość licznika
  const initialUserCount = getUserCount();
  userCountElement.textContent = initialUserCount;

  // Sprawdź i zaktualizuj licznik przy załadowaniu strony
  updateUserCount();
});

// Funkcja naliczania kosztów dodatków
function calculateAdditionalCosts() {
  const days = parseInt(document.getElementById("days").value) || 0;
  const childSeatCount =
    parseInt(document.getElementById("childSeat").value) || 0;
  const snowChainsCount =
    parseInt(document.getElementById("snowChains").value) || 0;

  // Koszty na podstawie ilości i liczby dni
  const childSeatCost = childSeatCount * days * 20;
  const snowChainsCost = snowChainsCount * days * 20;

  // Łączny koszt dodatków
  additionalCost = childSeatCost + snowChainsCost;
  console.log("Aktualny koszt dodatków:", additionalCost);
}

// Aktualizacja pola przy zmianie
document
  .getElementById("childSeat")
  .addEventListener("change", calculateAdditionalCosts);
document
  .getElementById("snowChains")
  .addEventListener("change", calculateAdditionalCosts);
document
  .getElementById("days")
  .addEventListener("change", calculateAdditionalCosts);

// Inicjalne naliczenie kosztów przy załadowaniu strony
document.addEventListener("DOMContentLoaded", calculateAdditionalCosts);

let isNavigationSelected = false;

// Funkcja toggle dla przycisku Nawigacja
function toggleNavigation() {
  const navigationButton = document.getElementById("navigationToggle");

  // Zmieniamy stan przycisku
  if (isNavigationSelected) {
    // Jeśli nawigacja jest już wybrana, zmieniamy na niewybraną
    navigationButton.textContent = "Wybierz";
    navigationButton.classList.remove("selected"); // Opcjonalnie dodaj klasę, jeśli styl ma się zmieniać
    isNavigationSelected = false;

    // Usuwamy koszt nawigacji
    subtractNavigationCost();
  } else {
    // Jeśli nawigacja nie była wybrana, zmieniamy na wybraną
    navigationButton.textContent = "Wybrano";
    navigationButton.classList.add("selected"); // Opcjonalnie dodaj klasę, jeśli styl ma się zmieniać
    isNavigationSelected = true;

    // Dodajemy koszt nawigacji
    addNavigationCost();
  }
}

// Funkcja dodawania kosztu Nawigacji
function addNavigationCost() {
  const days = parseInt(document.getElementById("days").value) || 0; // Pobieramy liczbę dni
  if (days > 0) {
    const additionalCost = days * 20; // Koszt 20 zł/dzień
    updateAdditionalCost(additionalCost);
  }
}

// Funkcja odejmowania kosztu Nawigacji
function subtractNavigationCost() {
  const days = parseInt(document.getElementById("days").value) || 0; // Pobieramy liczbę dni
  if (days > 0) {
    const additionalCost = days * 20; // Koszt 20 zł/dzień
    updateAdditionalCost(-additionalCost);
  }
}

// Funkcja aktualizowania kosztów dodatków
let additionalCost = 0;

function updateAdditionalCost(cost) {
  additionalCost += cost;
  console.log("Aktualny koszt dodatków:", additionalCost);
}
document
  .getElementById("navigationToggle")
  .addEventListener("click", toggleNavigation);
