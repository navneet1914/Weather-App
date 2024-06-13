const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer = document.querySelector('.weather-container');

const grantAccessContainer = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('[data-searchForm]');

const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');

//Initially needed variables-->

let currentTab = userTab; //by default when we will load the web page then the first page will be the user info page
const API_KEY = '45b79ec411000f361a3cdfde5a490c61';
currentTab.classList.add('current-tab');
getFromSessionStorage();

userTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

//switching between tabs
function switchTab(clickedTab){
   if (clickedTab != currentTab){
    currentTab.classList.remove('current-tab');
    currentTab = clickedTab;
    currentTab.classList.add('current-tab');

    //checked if search form wala container is invisible. if yes then make it visible
    if(!searchForm.classList.contains('active')){
        userInfoContainer.classList.remove('active');
        grantAccessContainer.classList.remove('active');
        searchForm.classList.add('active');
    }
    else{
        //mai pehle search waale tab pe tha ab your weather wala tab visible krna h!
        searchForm.classList.remove('active');
        userInfoContainer.classList.remove('active');
        //ab mai your weather tab me aa gya hu to weather v display krna pdega, so
        // lets check local storage first for coordinates if we have saved them there
        getFromSessionStorage();

    }
   }
}

//check if coordinates are already present in session(local) storage
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if(!localCoordinates){
        //agr local coordinates nahi mile tb
        grantAccessContainer.classList.add('active');
    }
    else{
        //agr local coordinates mil gye tb
        const coordinates = JSON.parse(localCoordinates); //converted json string into a json object and then stored it into a varibale 
        fetchUserWeatherInfo(coordinates); //ek aisa funcn jo user k coordinates i.e lat and long k aadhar pr weather info fetch kr k laata h
    }
}


// m ek api call marne jaa ra iss funcn me so i have made it as an async funcn
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates; //lat and lon nikaal lia coordinates k andr se
    //make grant container invisible
    grantAccessContainer.classList.remove('active');
    apiErrorContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add('active');

    // API Call
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();

        //api call maaar di and hmara data aa gya h then loader hta dete h ab
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
//jo v data mila hai api call krne se uss data ko UI pe render krwane k lie we use this function
// jo v data mila h usko UI pe uske jagah pe dynamically store krane k lie we use this function
        renderWeatherInfo(data); 

    }
    catch(err){
        loadingScreen.classList.remove('active');
        // alert('We do not have record for your city');
        // console.log('error aaya hai bhai saab');
    }

}

const wrap = document.querySelector('.wrapper');
function renderWeatherInfo(weatherInfo){

    //firstly we have to fetch the elements
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const description = document.querySelector('[data-weatherDescription]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windSpeed = document.querySelector('[data-windSpeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');

    //ye sb values hm json formatter me dekh k likh rhe honge--Kaise??
    // phle apne api ko google me likhe fir usme lat and lon and API key daal de
    //ek string of data aa jaega. ussko copy kr k ek json formatter me jaa k paste kre
    //vo string ek json object me convert ho jaega. fir wahi se reference le k hm yha usko access kr re honge easy h
    //fetch values from weatherinfo object and put it in UI elements
    cityName.innerText = `${weatherInfo?.name}`;
    // country ka flag aise laaenge
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    description.innerText = `${weatherInfo?.weather?.[0]?.description}`;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    const temperature = weatherInfo?.main?.temp;
    temp.innerText = `${temperature}°C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

    if (temperature < 20) {
        wrap.classList.add('cold');
        wrap.classList.remove('moderate', 'hot');
    } else if (temperature >= 20 && temperature < 38) {
        wrap.classList.add('moderate');
        wrap.classList.remove('cold', 'hot');
    } else {
        wrap.classList.add('hot');
        wrap.classList.remove('cold', 'moderate');
    }
    

}

const grantAccessButton = document.querySelector('[data-grantAccess]');
grantAccessButton.addEventListener('click', getLocation);

function getLocation() {
    if(navigator.geolocation){  //if(navigator.geolocation)-->checks whether geolocation is supported in your browser or not if yes condn below is executed
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert('No geolocation supported by this browser')
    }
}
function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    //store kia in the session storage
    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    //reflect krwaya in the UI
    fetchUserWeatherInfo(userCoordinates);
}

let searchInput = document.querySelector('[data-searchInput]')

searchForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    let cityName = searchInput.value.trim();
    if(cityName === "") return; //agr searchinput me jo value h vo empty h to wapas jaana pdega

    //agr empty ni h to
    fetchSearchWeatherInfo(cityName); //searchinput.value = cityName

});

const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");
const apiErrorContainer = document.querySelector(".api-error-container");

//because we have to fetch API so we converted this into an async funcn
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessContainer.classList.remove('active');
    apiErrorContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if (!data.name) {
            throw data;
          }
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);   
        
    } 
    catch (err) {
        loadingScreen.classList.remove('active');
        apiErrorContainer.classList.add("active");
        apiErrorMessage.innerText = 'City  Not  Found'
        
    }
}
