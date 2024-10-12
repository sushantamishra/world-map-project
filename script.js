// Initialize the map and set view to world coordinates
const map = L.map('map').setView([20, 0], 2); // Centered at coordinates [20, 0] with zoom level 2

// Use OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; OpenStreetMap contributors',
    maxZoom: 18,
}).addTo(map);

// Function to fetch country details using REST Countries API
async function getCountryData(countryCode) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const data = await response.json();
        const country = data[0];
        const capital = country.capital ? country.capital[0] : 'N/A';
        const currency = country.currencies ? Object.values(country.currencies)[0].name : 'N/A';
        const latlng = country.latlng;

        return { name: country.name.common, capital, currency, latlng };
    } catch (error) {
        console.error('Error fetching country data:', error);
        return null;
    }
}

// Function to fetch temperature data using WeatherAPI
async function getTemperature(city) {
    try {
        const apiKey = 'e1c1c62746c7413885c174719241210';
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
        const data = await response.json();
        return data.current.temp_c; // Temperature in Celsius
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return 'N/A';
    }
}

// Function to get local time using WeatherAPI
async function getLocalTime(city) {
    try {
        const apiKey = 'e1c1c62746c7413885c174719241210';
        const response = await fetch(`https://api.weatherapi.com/v1/timezone.json?key=${apiKey}&q=${city}`);
        const data = await response.json();
        return new Date(data.location.localtime).toLocaleTimeString();
    } catch (error) {
        console.error('Error fetching local time:', error);
        return 'N/A';
    }
}

// Add markers for each country
async function addMarkers() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const countries = await response.json();

        countries.forEach(async (country) => {
            const countryCode = country.cca2;
            const countryData = await getCountryData(countryCode);

            if (countryData && countryData.latlng) {
                const { name, capital, currency, latlng } = countryData;
                const [lat, lng] = latlng;

                // Get weather data for the country's capital
                const temperature = await getTemperature(capital);
                const localTime = await getLocalTime(capital);

                // Create a marker at the country's lat/lng coordinates
                const marker = L.marker([lat, lng]).addTo(map);

                // Display a popup with the country's info
                marker.bindPopup(`
                    <b>${name}</b><br>
                    Capital: ${capital}<br>
                    Currency: ${currency}<br>
                    Temperature: ${temperature}°C<br>
                    Local Time: ${localTime}
                `);
            }
        });
    } catch (error) {
        console.error('Error adding markers:', error);
    }
}

// Call the function to add markers
addMarkers();
