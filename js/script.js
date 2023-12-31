// Constantes para a API e URLs
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/reverse';

// Condições climáticas
const weatherConditions = {
    'Clear': "url('imagens/claro.jpg')",
    'Rain': "url('imagens/chuva.jpg')",
    'Clouds': "url('imagens/nuvens.jpg')",
    'Snow': "url('imagens/neve.jpg')",
    'Drizzle': "url('imagens/chuvisco.jpg')",
    'Thunderstorm': "url('imagens/tempestade.jpg')",
    'Fog': "url('imagens/neblina.jpg')",
    'Mist': "url('imagens/nevoa.jpg')",
    'Haze': "url('imagens/bruma.jpg')",
    'Smoke': "url('imagens/fumaca.jpg')",
    'Dust': "url('imagens/poeira.jpg')",
    'Sand': "url('imagens/areia.jpg')",
    'Ash': "url('imagens/cinzas.jpg')",
    'Squall': "url('imagens/rajada.jpg')",
    'Tornado': "url('imagens/tornado.jpg')"
};

// Função para alterar o plano de fundo com base no clima
function changeBackground(clima) {
    const body = document.body;
    body.style.backgroundImage = weatherConditions[clima] || '';
}

// Adicione indicadores visuais para mostrar quando os dados estão sendo carregados
async function fetchWeatherData(city) {
    const trimmedCity = city.trim();
    const loadingElement = document.getElementById('loading');
    loadingElement.classList.remove('hidden');

    try {
        const apiKey = await getApiKey();
        const response = await fetch(`${WEATHER_API_URL}?q=${encodeURI(trimmedCity)}&appid=${apiKey}&units=metric&lang=pt_br`);

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage.message}`);
        }

        const data = await response.json();
        loadingElement.classList.add('hidden');
        return data;
    } catch (error) {
        loadingElement.classList.add('hidden');
        displayError("Não foi possível encontrar a cidade. Verifique o nome e tente novamente.");
        throw error;
    }
}

// Função para exibir mensagens de erro
function displayError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
}

// Função para exibir dados climáticos na página
function displayWeatherData(data) {
    const weatherConditions = {
        'Clear': 'Claro',
        'Rain': 'Chuva',
        'Clouds': 'Nuvens',
        'Snow': 'Neve',
        'Drizzle': 'Chuvisco',
        'Thunderstorm': 'Tempestade',
        'Fog': 'Neblina',
        'Mist': 'Névoa',
        'Haze': 'Bruma',
        'Smoke': 'Fumaça',
        'Dust': 'Poeira',
        'Sand': 'Areia',
        'Ash': 'Cinzas',
        'Squall': 'Rajada',
        'Tornado': 'Tornado'
    };

    document.getElementById('city-name').innerHTML = '<i class="fas fa-map-marker-alt icon"></i> Temporal em: ' + data.name;
    document.getElementById('temperature').innerHTML = '<i class="fas fa-thermometer-half icon"></i> Temperatura atual: ' + data.main.temp + '°C';
    document.getElementById('condition').innerHTML = '<i class="fas fa-cloud icon"></i> Condição do tempo: ' + (weatherConditions[data.weather[0].main] || data.weather[0].main);
    document.getElementById('wind').innerHTML = '<i class="fas fa-wind icon"></i> Velocidade do vento: ' + data.wind.speed + ' km/h';
    document.getElementById('humidity').innerHTML = '<i class="fas fa-tint icon"></i> Umidade: ' + data.main.humidity + '%';
    document.getElementById('feelslike').innerHTML = '<i class="fas fa-temperature-low icon"></i> Sensação térmica: ' + data.main.feels_like + '°C';
    document.getElementById('pressure').innerHTML = '<i class="fas fa-tachometer-alt icon"></i> Pressão atmosférica: ' + data.main.pressure + ' mb';
    document.getElementById('precipitation').innerHTML = '<i class="fas fa-cloud-showers-heavy icon"></i> Precipitação: ' + (data.rain ? data.rain['1h'] : 0) + ' mm';
    document.getElementById('visibility').innerHTML = '<i class="fas fa-eye icon"></i> Visibilidade: ' + (data.visibility ? data.visibility / 1000 : 'N/A') + ' km';


    if (data.alerts) {
        console.log(data.alerts);
        document.getElementById('alert').textContent = 'Alerta: ' + data.alerts[0].description;
    } else {
        document.getElementById('alert').textContent = 'Sem alertas no momento.';
    }

    changeBackground(data.weather[0].main);
}

// Função para buscar dados climáticos e exibir na página
async function getWeather(city) {
    try {
        const data = await fetchWeatherData(city);
        displayWeatherData(data);
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Adiciona um ouvinte de evento para a tecla Enter no campo de entrada da cidade
document.getElementById('city-input').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        const city = document.getElementById('city-input').value;
        getWeather(city);
        getForecast(city);
    }
});

// Função para obter o nome da cidade com base na latitude e longitude
async function getCityName(lat, lon) {
    const apiKey = await getApiKey();
    const response = await fetch(`${GEO_API_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[0].name;
}

// Função para obter a localização atual do usuário
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const cityName = await getCityName(lat, lon);
                getWeather(cityName);
                getForecast(cityName);
            } catch (error) {
                console.error('Erro ao obter nome da cidade:', error);
            }
        }, error => {
            console.error('Erro ao obter localização:', error);
        });
    } else {
        console.error('Geolocalização não é suportada neste navegador.');
    }
}

// Adiciona ouvintes de eventos para os botões
document.getElementById('location-button').addEventListener('click', getLocation);
document.getElementById('search-button').addEventListener('click', function (event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    getWeather(city);
    getForecast(city);
});

async function getForecast(city) {
    try {
        const apiKey = await getApiKey();
        const response = await fetch(`${FORECAST_API_URL}?q=${encodeURI(city)}&appid=${apiKey}&units=metric&lang=pt_br`);
        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage.message}`);
        }
        const data = await response.json();
        const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        for (let i = 0; i < data.list.length; i += 8) {
            const date = new Date(data.list[i].dt_txt);
            const dayOfWeek = daysOfWeek[date.getDay()];
            const forecastElement = document.getElementById(`day${i / 8 + 1}`);
            forecastElement.innerHTML = `<i class="far fa-calendar-alt"></i> ${dayOfWeek} | Mín: ${data.list[i].main.temp_min}°C | Máx: ${data.list[i].main.temp_max}°C | ${data.list[i].weather[0].description.charAt(0).toUpperCase() + data.list[i].weather[0].description.slice(1)}.`;
            forecastElement.style.display = 'block';
        }

        document.getElementById('forecast').innerHTML = `<i class="far fa-calendar-alt"></i> Previsão para os próximos dias em ${data.city.name}`;
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Esconde inicialmente a seção de previsão
for (let i = 1; i <= 5; i++) {
    document.getElementById(`day${i}`).style.display = 'none';
}

// Use uma função assíncrona para proteger constantes sensíveis
async function getApiKey() {
    // Simule uma chamada de servidor para obter a chave
    return '3adf342557400a33545abde1b7a7bca9';
}
