const weather_api = "https://api.weatherbit.io/v2.0/current?lat=30.628&lon=-96.3344&key=59b64ecfcc1e48d99f3c00e333c61f97&include=minutely"; 

// updates the weather every time the statistic page shows up. Shows the temperature, a description, and the precipitation.
async function updateWeather() {
    try {
        const response = await fetch(weather_api);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const temp = data.data[0].temp;
        const precip = data.data[0].precip;
        const description = data.data[0].weather.description;

        const newTemp = (temp * (9 / 5) + 32).toFixed(2);

        document.getElementById("weather-info").textContent = `The temperature is: ${newTemp}°F, Description: ${description}`;

        if(precip == 0){
            document.getElementById("suggestion").textContent = "Expect more customers because there is no precipitation!";
        }
        else if(precip < 0.5){
            document.getElementById("suggestion").textContent = "Because it is drizzling, expect fewer customers than usual.";
        }
        else if(precip < 4){
            document.getElementById("suggestion").textContent = "There is moderate rain, so expect less customers.";
        }
        else if(precip < 8){
            document.getElementById("suggestion").textContent = "There is heavy rain, do not expect many customers.";
        }
        else{
            document.getElementById("suggestion").textContent = "There is very heavy rain. Maybe you should close the store.";
        }
    }
    
    catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById("weather-info").textContent = "Error loading weather data.";
    }
}


updateWeather();