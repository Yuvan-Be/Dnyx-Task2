const input = document.getElementById("cityInput");
const btn = document.getElementById("searchBtn");
const current = document.getElementById("currentWeather");
const forecastBox = document.getElementById("forecastBox");

// Click button → fetch
btn.addEventListener("click", fetchWeather);

// Press Enter → fetch
input.addEventListener("keypress", e => {
    if (e.key === "Enter") fetchWeather();
});

async function fetchWeather() {
    const city = input.value.trim();
    if (!city) {
        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 400);
        return;
    }

    current.innerHTML = "Loading...";
    current.style.opacity = 0;
    forecastBox.innerHTML = "";

    try {
        // Geocoding (city → lat/lon)
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const geoData = await geo.json();

        if (!geoData.results) {
            current.innerHTML = "City not found.";
            return;
        }

        const { latitude, longitude, name } = geoData.results[0];

        // Weather data
        const weather = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await weather.json();

        current.innerHTML = `
            <h2>${name}</h2>
            <p>Temperature: ${data.current.temperature_2m}°C</p>
            <p>Humidity: ${data.current.relative_humidity_2m}%</p>
            <p>Wind: ${data.current.wind_speed_10m} m/s</p>
        `;

        setTimeout(() => (current.style.opacity = 1), 50);

        for (let i = 0; i < 5; i++) {
            forecastBox.innerHTML += `
                <div class="card">
                    <h4>${data.daily.time[i]}</h4>
                    <p>Max: ${data.daily.temperature_2m_max[i]}°C</p>
                    <p>Min: ${data.daily.temperature_2m_min[i]}°C</p>
                </div>
            `;
        }

    } catch (err) {
        current.innerHTML = "Error fetching weather.";
        console.log(err);
    }
}