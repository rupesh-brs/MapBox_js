// Elements 
const map = document.querySelector("#map"); 
const search = document.getElementById("map-location"); 
const styleSelector = document.getElementById("map-style"); 
const suggestionsDiv = document.getElementById("suggestions"); 
const fullscreenBtn = document.getElementById("fullscreen-icon");

// Initialize the Mapbox map 
mapboxgl.accessToken = 'pk.eyJ1IjoicGFyaXNyaSIsImEiOiJja2ppNXpmaHUxNmIwMnpsbzd5YzczM2Q1In0.8VJaqwqZ_zh8qyeAuqWQgw'; 

const mapInstance = new mapboxgl.Map({ 
    container: 'map', 
    style: 'mapbox://styles/mapbox/streets-v11', 
    center: [80.18536880746353, 16.501575031841256], 
    zoom: 13 
}); 

// Full-Screen Toggle Function
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        map.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Display coordinates on mouse move
mapInstance.on('mousemove', (e) => {
    const lngLat = e.lngLat;
    document.getElementById('coordinates').innerText = `Longitude: ${lngLat.lng.toFixed(5)}, Latitude: ${lngLat.lat.toFixed(5)}`;
});

// Fetching map location
function fetchMapLocation(loc) { 
    const apiKey = 'pk.eyJ1IjoicGFyaXNyaSIsImEiOiJja2ppNXpmaHUxNmIwMnpsbzd5YzczM2Q1In0.8VJaqwqZ_zh8qyeAuqWQgw'; 
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc}.json?access_token=${apiKey}`; 

    fetch(url) 
        .then(response => { 
            if (!response.ok) { 
                throw new Error('Network response was not ok'); 
            } 
            return response.json(); 
        }) 
        .then(data => { 
            if (data.features.length > 0) { 
                const coordinates = data.features[0].geometry.coordinates; 
                mapInstance.flyTo({ 
                    center: coordinates, 
                    zoom: 13 
                }); 
                new mapboxgl.Marker() 
                    .setLngLat(coordinates) 
                    .addTo(mapInstance); 
                suggestionsDiv.innerHTML = ''; 
            } else { 
                console.log('Location not found'); 
                suggestionsDiv.innerHTML = ''; 
            } 
        }) 
        .catch(error => { 
            console.error('Error fetching location:', error); 
        }); 
} 

// Fetch Suggestions Based on Input
function fetchSuggestions(loc) {
    const apiKey = 'pk.eyJ1IjoicGFyaXNyaSIsImEiOiJja2ppNXpmaHUxNmIwMnpsbzd5YzczM2Q1In0.8VJaqwqZ_zh8qyeAuqWQgw'; 
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc}.json?access_token=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            suggestionsDiv.innerHTML = ''; 
            data.features.forEach(feature => {
                const suggestion = document.createElement('div');
                suggestion.textContent = feature.place_name;
                suggestion.classList.add('suggestion-item');
                suggestion.onclick = () => {
                    search.value = feature.place_name; 
                    fetchMapLocation(feature.place_name);
                    suggestionsDiv.innerHTML = ''; 
                };
                suggestionsDiv.appendChild(suggestion);
            });
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
        });
}

// Input Event Listener for Location Search Suggestions
search.addEventListener('input', () => { 
    let loc = search.value.trim().toLowerCase(); 
    if (loc.length > 2) { 
        fetchSuggestions(loc); 
    } else {
        suggestionsDiv.innerHTML = ''; 
    }
}); 

// Change Map Style Based on Selector
styleSelector.addEventListener('change', (event) => { 
    const selectedStyle = event.target.value; 
    mapInstance.setStyle(`mapbox://styles/mapbox/${selectedStyle}`); 
});
