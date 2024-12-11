document.addEventListener("DOMContentLoaded", function () {
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

    document.getElementById("seats").addEventListener("input", function () {
        const value = this.value;
        const max = this.max;
        const min = this.min;

        const seatsValue = document.getElementById("seatsValue");
        seatsValue.textContent = value;

        const percent = ((value - min) / (max - min)) * 100;
        const rangeWidth = this.offsetWidth;
        const thumbWidth = 20;
        const offset = thumbWidth / 2;
        const position = (percent / 100) * rangeWidth - offset;

        seatsValue.style.left = `${position}px`;

        this.style.background = `linear-gradient(to right, #007bff ${percent}%, #e6f7ff ${percent}%)`;
    });

    document.getElementById("price").addEventListener("input", function () {
        document.getElementById("priceValue").textContent = this.value + " zł";
    });

    const apiUrl = "https://run.mocky.io/v3/8b7fe4b1-5f39-442b-b1ca-bad7dd11a9e2";

    async function fetchCars() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Błąd podczas pobierania danych z API");
            const cars = await response.json();
            const formattedCars = formatPrices(cars);
            displayPaginatedCars(formattedCars, 1);
            setupPagination(formattedCars);
        } catch (error) {
            console.error("Wystąpił błąd:", error);
        }
    }

    function formatPrices(cars) {
        return cars.map(car => {
            return {
                ...car,
                dailyPriceWithVAT: parseFloat(car.dailyPriceWithVAT).toLocaleString("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
                priceWithVAT: parseFloat(car.priceWithVAT).toLocaleString("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
                monthlyPrice: parseFloat(car.monthlyPrice).toLocaleString("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
            };
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
            carPrice.textContent = `Cena: ${car.dailyPriceWithVAT}`;

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

            carElement.appendChild(carImage);
            carElement.appendChild(carDetails);

            container.appendChild(carElement);
        });
    }

    function setupPagination(cars, carsPerPage = 6) {
        const paginationContainer = document.getElementById("pagination-container");
        paginationContainer.innerHTML = "";

        const totalPages = Math.ceil(cars.length / carsPerPage);

        let currentPage = 1;

        function renderPagination() {
            paginationContainer.innerHTML = "";

            const prevButton = document.createElement("button");
            prevButton.textContent = "«";
            prevButton.classList.add("pagination-arrow");
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayPaginatedCars(cars, currentPage, carsPerPage);
                    renderPagination();
                }
            });
            paginationContainer.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("button");
                pageButton.textContent = i;
                pageButton.classList.add("pagination-button");
                if (i === currentPage) {
                    pageButton.classList.add("active");
                }
                pageButton.addEventListener("click", () => {
                    currentPage = i;
                    displayPaginatedCars(cars, currentPage, carsPerPage);
                    renderPagination();
                });
                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement("button");
            nextButton.textContent = "»";
            nextButton.classList.add("pagination-arrow");
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener("click", () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayPaginatedCars(cars, currentPage, carsPerPage);
                    renderPagination();
                }
            });
            paginationContainer.appendChild(nextButton);
        }

        renderPagination();
    }

    const filterForm = document.getElementById("filterForm");
    filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(filterForm);
        console.log("Submitted filter data:", Object.fromEntries(formData.entries()));
    });

    fetchCars();
});
