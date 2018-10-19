// _ = helper functions
let _calculateTimeDistance = (startTime, endTime) => {
	// Bereken hoeveel tijd er tussen deze twee periodes is.
	const start = new Date('0001-01-01 ' + startTime);
	const end = new Date('0001-01-01 ' + endTime);

	// Tip: werk met minuten.
	const startMinutes = (start.getHours() * 60) + start.getMinutes;
	const endMinutes = (end.getHours() * 60) + end.getMinutes;

	return endMinutes - startMinutes;
}

// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
let _convertTime = (t) => {
	/* Convert 12 ( am / pm ) naar 24HR */
	let time = new Date('0001-01-01 ' + t);
	let formatted = ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2);
	return formatted;
}

// 5 TODO: maak updateSun functie
const updateSun = (sun, left, bottom, time) =>{
	sun.style.left = `${left}%`;
	sun.style.bottom = `${bottom}%`;
	sun.setAttribute("data-time", ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2));
	
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = ( totalMinutes, sunrise ) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	const sun = document.querySelector(".js-sun");
	const minutesLeft = document.querySelector(".js-time-left");
	const sunRiseDate = new Date("0001-01-01" + sunrise);

	let today = new Date();
	// sun.setAttribute("date-time", _convertTime(today));
	
	let minutesSunUp =  ((today.getHours() *60) + today.getMinutes()) - ((sunRiseDate.getHours()* 60) + sunRiseDate.getMinutes());



	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	// Bepaal het aantal minuten dat de zon al op is.

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	let percentage = (100 / totalMinutes) * minutesSunUp;
	let sunLeft = percentage;
	let sunBottom = (percentage < 50) ? (percentage * 2) : (100 - percentage * 2);
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	document.querySelector("html").classList.add("is-loaded");
	// Vergeet niet om het resterende aantal minuten in te vullen.
	updateSun(sun,sunLeft,sunBottom, today);

	// Nu maken we een functie die de zon elke minuut zal updaten
	let t = setInterval(() => {
		// updateSun(sun,sunLeft,sunBottom, today);
	},60000);
	// Bekijk of de zon niet nog onder of reeds onder is
	
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = ( queryResponse ) => {
	// We gaan eerst een paar onderdelen opvullen
	let sunRise = document.querySelector(".js-sunrise");
	let sunSet = document.querySelector(".js-sunset");
	let location = document.querySelector(".js-location");
	
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.

	sunRise.innerHTML = _convertTime(queryResponse.astronomy.sunrise);
	sunSet.innerHTML = _convertTime(queryResponse.astronomy.sunset);
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	location.innerHTML = `${queryResponse.location.city}, ${queryResponse.location.country}`;

	// Hier gaan we een functie oproepen die de zon een bepaalde postie kan geven en dit kan updaten.
	placeSunAndStartMoving(_calculateTimeDistance(queryResponse.astronomy.sunrise, queryResponse.astronomy.sunset),queryResponse.astronomy.sunrise);
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = ( lat, lon ) => {
	// Eerst bouwen we onze url op
	const ENDPOOINT = `https://query.yahooapis.com/v1/public/yql?q=`;
	// en doen we een query met de Yahoo query language
	let query = `select astronomy,location  from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="(${lat},${lon})")`;

	// Met de fetch API proberen we de data op te halen.
	fetch(`${ENDPOOINT}${query}&format=json`)
	.then(result => {
		// console.log(result);
		return result.json();
	})
	// Als dat gelukt is, gaan we naar onze showResult functie.
	.then(data => {
		// console.log("data",data);
		showResult(data.query.results.channel);
	})
	.catch(err => {
			console.error(err);
	});
}

document.addEventListener( 'DOMContentLoaded', function () {
	// 1 We will query the API with longitude and latitude.
	
	getLocation();
	
});

function getLocation() {
    if (navigator.geolocation) {
		
		navigator.geolocation.getCurrentPosition((position)=>{
			getAPI(position.coords.latitude, position.coords.longitude);
		});
		
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
