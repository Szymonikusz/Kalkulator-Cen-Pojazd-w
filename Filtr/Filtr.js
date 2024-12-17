document.addEventListener("DOMContentLoaded", () => {
    const vehicleClassButtons = document.querySelectorAll(".vehicle-class button");

    vehicleClassButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            if (button.classList.contains("selected")) {
                button.classList.remove("selected");
                document.getElementById("vehicleClass").value = "";
            } else {
                vehicleClassButtons.forEach(btn => btn.classList.remove("selected"));
                button.classList.add("selected");
                document.getElementById("vehicleClass").value = button.getAttribute("data-class");
            }
        });
    });

    const optionContainers = document.querySelectorAll(".options-grid .option");
    optionContainers.forEach(option => {
        option.addEventListener("click", function (event) {
            event.preventDefault();

            const radio = option.querySelector("input[type='radio']");

            if (option.classList.contains("selected")) {
                option.classList.remove("selected");
                radio.checked = false;
            } else {
                const siblingOptions = option.parentElement.querySelectorAll(".option");
                siblingOptions.forEach(opt => {
                    opt.classList.remove("selected");
                    opt.querySelector("input[type='radio']").checked = false;
                });

                option.classList.add("selected");
                radio.checked = true;
            }
        });
    });

    const initSeatsSlider = () => {
        const seatsInput = document.getElementById("seats");
        const seatsValue = document.getElementById("seatsValue");

        seatsInput.addEventListener("input", function () {
            const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
            const position = percent * (this.offsetWidth / 100) - 10;
            seatsValue.textContent = this.value;
            seatsValue.style.left = `${position}px`;
            this.style.background = `linear-gradient(to right, #007bff ${percent}%, #e6f7ff ${percent}%)`;
        });
    };

    const apiUrl = "/api/cars.json";

    async function fetchCars() {
        const container = document.getElementById("cars-container");
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Błąd podczas pobierania danych z API");
            const cars = await response.json();
            displayPaginatedCars(cars, 1);
            setupPagination(cars);
            return cars;
        } catch (error) {
            console.error("Wystąpił błąd:", error.message);
            container.innerHTML = `<p class="error-message">Nie udało się załadować danych. Spróbuj ponownie później.</p>`;
            return [];
        }
    }

    function formatPrice(price) {
        return parseFloat(price).toLocaleString("pl-PL", {
            style: "currency",
            currency: "PLN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function displayPaginatedCars(cars, page, carsPerPage = 6) {
        const container = document.getElementById("cars-container");
        container.innerHTML = "";

        const startIndex = (page - 1) * carsPerPage;
        const endIndex = startIndex + carsPerPage;
        const carsToDisplay = cars.slice(startIndex, endIndex);

        carsToDisplay.forEach(car => {
            const carElement = document.createElement("div");
            carElement.classList.add("car");
            carElement.setAttribute("data-id", car.id);

            const carImage = document.createElement("img");
            carImage.src = `https://eurologic.rentcarsoft.pl/grafiki/oferta/256/${car.imageIdentifier}`;
            carImage.alt = car.name;

            const carDetails = document.createElement("div");
            carDetails.classList.add("car-details");

            const carTitle = document.createElement("h2");
            carTitle.classList.add("car-title");
            carTitle.textContent = `${car.name} (${car.branchName})`;

            const carPrice = document.createElement("p");
            carPrice.classList.add("car-price");
            carPrice.textContent = `Cena: ${formatPrice(car.dailyPriceWithVAT)}`;

            const carAttributes = document.createElement("ul");
            carAttributes.classList.add("car-attributes");
            car.attributes.forEach(attribute => {
                const attributeItem = document.createElement("li");
                attributeItem.textContent = attribute;
                carAttributes.appendChild(attributeItem);
            });

            carDetails.appendChild(carTitle);
            carDetails.appendChild(carPrice);
            carDetails.appendChild(carAttributes);

            const calculatorButton = document.createElement("button");
            calculatorButton.textContent = "Kalkulator";
            calculatorButton.classList.add("calculator-btn");
            calculatorButton.addEventListener("click", () => {
                redirectToCalculator(car);
            });

            carDetails.appendChild(calculatorButton);
            carElement.appendChild(carImage);
            carElement.appendChild(carDetails);

            container.appendChild(carElement);
        });
    }

    function setupPagination(cars, carsPerPage = 6) {
        const paginationContainer = document.getElementById("pagination-container");
        const totalPages = Math.ceil(cars.length / carsPerPage);
        let currentPage = 1;

        const renderPageButtons = () => {
            
            paginationContainer.innerHTML = `
                <button class="pagination-arrow" ${currentPage === 1 ? "disabled" : ""}>«</button>
                ${Array.from({ length: totalPages }, (_, i) => `
                    <button class="pagination-button ${currentPage === i + 1 ? "active" : ""}">${i + 1}</button>
                `).join("")}
                <button class="pagination-arrow" ${currentPage === totalPages ? "disabled" : ""}>»</button>
            `;

            const buttons = paginationContainer.querySelectorAll("button");
            buttons.forEach((btn) => {
                btn.addEventListener("click", () => {
                    if (btn.textContent === "«") currentPage--;
                    else if (btn.textContent === "»") currentPage++;
                    else currentPage = parseInt(btn.textContent);
                    displayPaginatedCars(cars, currentPage, carsPerPage);
                    renderPageButtons();
                });
            });
        };

        renderPageButtons();
    }

    function getFilterData() {
        const seats = document.getElementById("seats").value;
        const vehicleClass = document.getElementById("vehicleClass").value;

        const gearbox = document.querySelector("input[name='gearbox']:checked");
        const selectedGearbox = gearbox ? gearbox.value : null;

        const fuel = document.querySelector("input[name='fuel']:checked");
        const selectedFuel = fuel ? fuel.value : null;

        const sliderValues = slider.noUiSlider.get();
        const minPrice = parseInt(sliderValues[0]);
        const maxPrice = parseInt(sliderValues[1]);

        return {
            seats: parseInt(seats) || null,
            vehicleClass: vehicleClass || null,
            gearbox: selectedGearbox,
            fuel: selectedFuel,
            minPrice,
            maxPrice
        };
    }

    const filterForm = document.getElementById("filterForm");
    filterForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const filterData = getFilterData();
        console.log("Wybrane dane filtra:", filterData);

        fetchCars().then(cars => {
            const filteredCars = filterCars(cars, filterData);
            displayPaginatedCars(filteredCars, 1);
            setupPagination(filteredCars);
        });
    });

    function filterCars(cars, filterData) { 
        return cars.filter(car => (
            (!filterData.seats || car.seats >= parseInt(filterData.seats)) &&
            (!filterData.vehicleClass || car.priceListName === filterData.vehicleClass) &&
            (!filterData.gearbox || car.transmissionType === filterData.gearbox) &&
            (!filterData.fuel || car.fuelType === filterData.fuel) &&  // ZMIANA TUTAJ
            (car.dailyPriceWithVAT >= filterData.minPrice && car.dailyPriceWithVAT <= filterData.maxPrice)
        ));
    }

    function redirectToCalculator(car) {
        const carId = encodeURIComponent(car.id);
        const baseUrl = "index.html";
        window.location.href = `${baseUrl}?carId=${carId}`;
    }

    fetchCars();

    initSeatsSlider();
});

var slider = document.getElementById('slider');

noUiSlider.create(slider, {
    start: [50, 400],
    connect: true,
    range: {
        'min': 50,
        'max': 400
    },
    step: 1,
    tooltips: true,
    format: {
        to: function (value) {
            return Math.round(value) + " zł";
        },
        from: function (value) {
            return Number(value.replace(' zł', ''));
        }
    }
});
