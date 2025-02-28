// Global variables
const API_BASE_URL = 'http://localhost:5000/api';
const restaurantDetail = document.getElementById('restaurant-detail');

// Get restaurant ID from URL
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('id');

// Load restaurant details when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (restaurantId) {
        loadRestaurantDetails(restaurantId);
    } else {
        restaurantDetail.innerHTML = '<div class="error">No restaurant ID provided</div>';
    }
});

async function loadRestaurantDetails(id) {
    restaurantDetail.innerHTML = '<div class="loading">Loading restaurant details...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
        const restaurant = await response.json();
        
        if (response.ok) {
            displayRestaurantDetails(restaurant);
        } else {
            throw new Error(restaurant.error || 'Failed to load restaurant details');
        }
    } catch (error) {
        console.error('Error:', error);
        restaurantDetail.innerHTML = `<div class="error">Error loading restaurant details: ${error.message}</div>`;
    }
}

function displayRestaurantDetails(restaurant) {
    document.title = `${restaurant.name || 'Restaurant Details'} - Nutritor Finder`;
    
    restaurantDetail.innerHTML = `
        <div class="detail-header">
            <h2>${restaurant.name || 'Unnamed Restaurant'}</h2>
            <div class="rating">Rating: ${restaurant.aggregate_rating || 'No ratings'}/5</div>
            <div class="cuisines">${restaurant.cuisines || 'Various Cuisines'}</div>
        </div>
        
        <div class="detail-info">
            <div class="detail-section">
                <h3>Location</h3>
                <p>${restaurant.location_address || 'Address not available'}</p>
                <p>${restaurant.location_city || ''}, ${restaurant.location_country || ''}</p>
                <p>Latitude: ${restaurant.location_latitude || 'N/A'}, Longitude: ${restaurant.location_longitude || 'N/A'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Contact</h3>
                <p>Website: ${restaurant.restaurant_url ? `<a href="${restaurant.restaurant_url}" target="_blank">${restaurant.restaurant_url}</a>` : 'Not available'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Details</h3>
                <p>Average Cost for Two: ${restaurant.currency || ''}${restaurant.average_cost_for_two || 'N/A'}</p>
                <p>Has Online Delivery: ${restaurant.has_online_delivery ? 'Yes' : 'No'}</p>
                <p>Has Table Booking: ${restaurant.has_table_booking ? 'Yes' : 'No'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Highlights</h3>
                <p>${restaurant.highlights ? restaurant.highlights.join(', ') : 'No highlights available'}</p>
            </div>
        </div>
        
        <button onclick="window.history.back()">Back to List</button>
    `;
}

// JavaScript for scroll-to-top button with progress
const scrollToTopBtn = document.createElement('div');
scrollToTopBtn.classList.add('scroll-to-top');
document.body.appendChild(scrollToTopBtn);

// Update progress and visibility on scroll
window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (window.scrollY / scrollHeight) * 100;

    scrollToTopBtn.style.setProperty('--progress', scrollPercent);

    if (window.scrollY > 200) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

// Scroll to top on button click
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});