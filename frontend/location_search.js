// Global variables
const API_BASE_URL = 'http://localhost:5000/api';
const locationForm = document.getElementById('location-form');
const useLocationBtn = document.getElementById('use-current-location');
const resultsContainer = document.getElementById('location-results');

// Event listeners
document.addEventListener('DOMContentLoaded', setupListeners);

function setupListeners() {
    locationForm.addEventListener('submit', handleLocationSearch);
    useLocationBtn.addEventListener('click', useCurrentLocation);
}

async function handleLocationSearch(event) {
    event.preventDefault();
    resultsContainer.innerHTML = '<div class="loading">Searching for restaurants...</div>';
    
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const radius = document.getElementById('radius').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/search/location?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
        const restaurants = await response.json();
        
        displayResults(restaurants);
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = `<div class="error">Error searching for restaurants: ${error.message}</div>`;
    }
}

function useCurrentLocation() {
    if (navigator.geolocation) {
        resultsContainer.innerHTML = '<div class="loading">Getting your location...</div>';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('latitude').value = position.coords.latitude;
                document.getElementById('longitude').value = position.coords.longitude;
                resultsContainer.innerHTML = '<div class="success">Location obtained! Click "Search" to find restaurants.</div>';
            },
            (error) => {
                console.error('Geolocation error:', error);
                resultsContainer.innerHTML = `<div class="error">Error getting your location: ${error.message}</div>`;
            }
        );
    } else {
        resultsContainer.innerHTML = '<div class="error">Geolocation is not supported by your browser</div>';
    }
}

function displayResults(restaurants) {
    if (restaurants.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No restaurants found in this area.</div>';
        return;
    }
    
    resultsContainer.innerHTML = '<h2>Nearby Restaurants</h2>';
    
    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="content">
                <h3>${restaurant.name || 'Unnamed Restaurant'}</h3>
                <div class="cuisines">${restaurant.cuisines || 'Various Cuisines'}</div>
                <div class="location">${restaurant.location_address || ''}, ${restaurant.location_city || ''}</div>
                <div class="price">Average for two: ${restaurant.currency || ''}${restaurant.average_cost_for_two || 'N/A'}</div>
                <div class="distance">Distance: ${restaurant.distance ? restaurant.distance.toFixed(2) + ' km' : 'Unknown'}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `detail.htm?id=${restaurant.id}`;
        });
        
        resultsContainer.appendChild(card);
    });
}