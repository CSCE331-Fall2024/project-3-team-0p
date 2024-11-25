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

const languageSelector = document.getElementById('language-select');
languageSelector.addEventListener('change', (event) => {
    targetLanguage = event.target.value;
    sessionStorage.setItem("language", targetLanguage);
    window.location.reload();
});

//translates text in page
async function translatePage() {
    const apiKey = 'AIzaSyBBXNpFEe3ng4ydNNgHXK_s6cNgwjt-_so';
    if (targetLanguage == "null") return;

    const elementsToTranslate = Array.from(document.body.querySelectorAll('*')).filter((el) =>
        el.childNodes.length === 1 && 
        el.childNodes[0].nodeType === Node.TEXT_NODE && 
        el.textContent.trim() !== '' &&
        !el.hasAttribute('data-ignore')
    );
  
    for (const element of elementsToTranslate) {
        const textToTranslate = element.textContent.trim();
        console.log("translating " + textToTranslate + " to " + targetLanguage);
        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({q: textToTranslate, target: targetLanguage,}),
            });
            const data = await response.json();
            element.textContent = data.data.translations[0].translatedText;
        } catch(error) {
            console.error('Translation error:', error);
        }
    }
}



updateWeather();