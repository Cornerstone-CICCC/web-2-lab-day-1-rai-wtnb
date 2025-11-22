const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherContainer = document.getElementById("weather-container");
const cityNameEl = document.getElementById("city-name");
const temperatureEl = document.getElementById("temperature");
const countryEl = document.getElementById("country");
const timezoneEl = document.getElementById("timezone");
const populationEl = document.getElementById("population");
const forecastEl = document.getElementById("forecast");
const errorMessageEl = document.getElementById("error-message");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    searchCity(city);
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      searchCity(city);
    }
  }
});

async function searchCity(city) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
    );
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("City not found");
    }

    const result = data.results[0];
    const { name, latitude, longitude, timezone, country, population } = result;

    getWeather(latitude, longitude, name, timezone, country, population);
  } catch (error) {
    showError("City not found");
  }
}

async function getWeather(lat, long, name, timezone, country, population) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,is_day,rain,showers&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2`
    );
    const data = await response.json();

    updateUI(data, name, timezone, country, population);
  } catch (error) {
    showError("City not found");
  }
}

function updateUI(data, name, timezone, country, population) {
  errorMessageEl.classList.add("hidden");
  weatherContainer.classList.remove("hidden");

  const current = data.current;
  const isDay = current.is_day === 1;

  cityNameEl.textContent = name;
  temperatureEl.textContent = `${current.temperature_2m} ${data.current_units.temperature_2m}`;

  countryEl.textContent = country || "N/A";
  timezoneEl.textContent = timezone || "N/A";
  populationEl.textContent = population || "N/A";

  const tomorrowMax = data.daily.temperature_2m_max[1];
  const tomorrowMin = data.daily.temperature_2m_min[1];
  const unit = data.daily_units.temperature_2m_max;

  forecastEl.innerHTML = `Low: ${tomorrowMin} ${unit}<br>Max: ${tomorrowMax} ${unit}`;

  updateBackground(isDay);
}

function updateBackground(isDay) {
  if (isDay) {
    document.body.classList.remove("night");
    document.body.classList.add("day");
  } else {
    document.body.classList.remove("day");
    document.body.classList.add("night");
  }
}

function showError(message) {
  weatherContainer.classList.add("hidden");
  errorMessageEl.textContent = message;
  errorMessageEl.classList.remove("hidden");
}
