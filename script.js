const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");

const weatherInfoSection = document.querySelector(".weather-info");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityTxt = document.querySelector(".humidity-value-txt");
const windTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");

const forecastItemsContainer = document.querySelector(
  ".forecast-items-container"
);

const apiKey = "1450175ab6df34cb9ce63b3bc3f5a99e";

//Search city

searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = "";
    cityInput.blur();
  }
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key == "Enter" && cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = "";
    cityInput.blur();
  }
});

//Update weather Section
async function updateWeatherInfo(city) {
  const weatherData = await getFetchData("weather", city);

  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;
  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + "°C";
  conditionTxt.textContent = main;
  humidityTxt.textContent = humidity + "%";
  windTxt.textContent = speed + "M/s";

  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `./assets/${getWeatherIcon(id)}.png`;
  await updateForecastInfo(city);

  showDisplaySection(weatherInfoSection);
}

async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

function getWeatherIcon(id) {
  if (id <= 232) return "thunderstorm";
  if (id <= 321) return "drizzle";
  if (id <= 531) return "rain";
  if (id <= 622) return "snow";
  if (id == 800) return "clear";
  return "clouds";
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };
  return currentDate.toLocaleDateString("en-GB", options);
}

//Forecast Section
async function updateForecastInfo(city) {
  const forecastsData = await getFetchData("forecast", city);

  const timeTaken = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];

  forecastItemsContainer.innerHTML = "";

  forecastsData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastItems(forecastWeather);
    }
  });
}

function updateForecastItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOption = {
    day: "2-digit",
    month: "short",
  };

  const dateResult = dateTaken.toLocaleDateString("en-GB", dateOption);

  const forecastItem = `
    <div class="forecast-item">
      <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
      <img src="./assets/${getWeatherIcon(id)}.png" class="forecast-item-img" />
      <h5 class="forecast-item-temp">${Math.round(temp)} &deg;C</h5>
    </div>
  `;
  forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(
    (sec) => (sec.style.display = "none")
  );
  section.style.display = "flex";
}

// Dark Mode Switch Button

const darkModeBtn = document.querySelector(".dark-mode-btn");

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Location Button

const locationBtn = document.querySelector(".location-btn");

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      updateWeatherByLocation(lat, lon);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

async function updateWeatherByLocation(lat, lon) {
  const weatherData = await getFetchDataByCoords("weather", lat, lon);

  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;
  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + "°C";
  conditionTxt.textContent = main;
  humidityTxt.textContent = humidity + "%";
  windTxt.textContent = speed + "M/s";

  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `./assets/${getWeatherIcon(id)}.png`;
  await updateForecastInfoByCoords(lat, lon);

  showDisplaySection(weatherInfoSection);
}

async function getFetchDataByCoords(endPoint, lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

async function updateForecastInfoByCoords(lat, lon) {
  const forecastsData = await getFetchDataByCoords("forecast", lat, lon);

  const timeTaken = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];

  forecastItemsContainer.innerHTML = "";

  forecastsData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastItems(forecastWeather);
    }
  });
}
