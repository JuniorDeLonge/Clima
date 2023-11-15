// Função para alterar o plano de fundo com base no clima
function changeBackground(clima) {
    const body = document.body;
    const weatherImages = {
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
    body.style.backgroundImage = weatherImages[clima] || '';
}

async function fetchWeatherData(city) {
    const trimmedCity = city.trim();

    document.getElementById('loading').classList.remove('hidden');
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(trimmedCity)}&appid=3adf342557400a33545abde1b7a7bca9&units=metric&lang=pt_br`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById('loading').classList.add('hidden');
        return data;
    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        alert("Não foi possível encontrar a cidade. Verifique o nome e tente novamente.");
    }
}


// Função para exibir os dados do tempo na página
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
    document.getElementById('city-name').textContent = 'Tempo em: ' + data.name;
    document.getElementById('temperature').textContent = 'Temperatura atual: ' + data.main.temp + '°C';
    document.getElementById('condition').textContent = 'Condição do tempo: ' + (weatherConditions[data.weather[0].main] || data.weather[0].main);
    document.getElementById('wind').textContent = 'Velocidade do vento: ' + data.wind.speed + ' km/h';
    document.getElementById('humidity').textContent = 'Umidade: ' + data.main.humidity + '%';
    document.getElementById('feelslike').textContent = 'Sensação térmica: ' + data.main.feels_like + '°C';
    document.getElementById('pressure').textContent = 'Pressão atmosférica: ' + data.main.pressure + ' mb';
    document.getElementById('precipitation').textContent = 'Precipitação: ' + (data.rain ? data.rain['1h'] : 0) + ' mm';
    document.getElementById('visibility').textContent = 'Visibilidade: ' + (data.visibility ? data.visibility / 1000 : 'N/A') + ' km';
    if (data.alerts) {
        console.log(data.alerts);  // Adicione esta linha para verificar os alertas
        document.getElementById('alert').textContent = 'Alerta: ' + data.alerts[0].description;
    } else {
        document.getElementById('alert').textContent = 'Sem alertas no momento.';
    }
    changeBackground(data.weather[0].main); // Adicione esta linha
}


// Função para buscar e exibir os dados do tempo
async function getWeather(city) {
    try {
        const data = await fetchWeatherData(city);
        displayWeatherData(data);
    } catch (error) {
        console.error('Erro:', error);
    }
}

document.getElementById('city-input').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        const city = document.getElementById('city-input').value;
        getWeather(city);
        getForecast(city);
    }
});


// Função para buscar o nome da cidade com base na latitude e longitude
async function getCityName(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=3adf342557400a33545abde1b7a7bca9`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[0].name;
}

// Função para buscar a localização atual do usuário
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const cityName = await getCityName(lat, lon);
            getWeather(cityName);
            getForecast(cityName);
        }, error => {
            console.error('Erro ao obter localização:', error);
        });
    } else {
        console.error('Geolocalização não é suportada neste navegador.');
    }
}

// Adicionando event listeners para os botões
document.getElementById('location-button').addEventListener('click', getLocation);
document.getElementById('search-button').addEventListener('click', function (event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    getWeather(city);
    getForecast(city);
});

// Função para buscar e exibir a previsão do tempo
async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURI(city)}&appid=3adf342557400a33545abde1b7a7bca9&units=metric&lang=pt_br`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        for (let i = 0; i < data.list.length; i += 8) {
            const date = new Date(data.list[i].dt_txt);
            const dayOfWeek = daysOfWeek[date.getDay()];
            const forecastElement = document.getElementById(`day${i / 8 + 1}`);
            forecastElement.textContent = `${dayOfWeek} | Mín: ${data.list[i].main.temp_min}°C | Máx: ${data.list[i].main.temp_max}°C | ${data.list[i].weather[0].description.charAt(0).toUpperCase() + data.list[i].weather[0].description.slice(1)}.`;
            forecastElement.style.display = 'block';
        }
        // Adicione o nome da cidade à mensagem de previsão
        document.getElementById('forecast').textContent = 'Previsão para os próximos dias em ' + data.city.name;
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Esconda inicialmente a seção de previsão
for (let i = 1; i <= 5; i++) {
    document.getElementById(`day${i}`).style.display = 'none';
}

// Adicione um ouvinte de evento ao botão de pesquisa
document.getElementById('search-button').addEventListener('click', function () {
    var city = document.getElementById('city-input').value;
    if (city) {
        // Se uma cidade foi pesquisada, busque a previsão do tempo
        getForecast(city);
    } else {
        // Se nenhuma cidade foi pesquisada, esconda a seção de previsão
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`day${i}`).style.display = 'none';
        }
    }
});

