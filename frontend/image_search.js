// Global variables
const API_BASE_URL = 'http://localhost:5000/api';
const imageForm = document.getElementById('image-form');
const imageInput = document.getElementById('food-image');
const imagePreview = document.getElementById('image-preview');
const previewContainer = document.getElementById('preview-container');
const resultsContainer = document.getElementById('image-results');

// Event listeners
document.addEventListener('DOMContentLoaded', setupListeners);

function setupListeners() {
    imageForm.addEventListener('submit', handleImageSearch);
    imageInput.addEventListener('change', showImagePreview);
}

function showImagePreview() {
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            previewContainer.classList.remove('hidden');
        }
        
        reader.readAsDataURL(imageInput.files[0]);
    }
}

async function handleImageSearch(event) {
    event.preventDefault();
    resultsContainer.innerHTML = '<div class="loading">Analyzing image and searching for restaurants...</div>';
    
    if (!imageInput.files || !imageInput.files[0]) {
        resultsContainer.innerHTML = '<div class="error">Please select an image first</div>';
        return;
    }
    
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/search/image`, {
            method: 'POST',
            body: formData
        });
        
        const restaurants = await response.json();
        displayResults(restaurants);
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = `<div class="error">Error searching for restaurants: ${error.message}</div>`;
    }
}

function displayResults(restaurants) {
    if (restaurants.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No restaurants found matching this food image.</div>';
        return;
    }
    
    resultsContainer.innerHTML = '<h2>Restaurants Matching Your Food Image</h2>';
    
    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="content">
                <h3>${restaurant.name || 'Unnamed Restaurant'}</h3>
                <div class="cuisines">${restaurant.cuisines || 'Various Cuisines'}</div>
                <div class="location">${restaurant.location?.locality || ''}, ${restaurant.location?.city || ''}</div>
                <div class="price">Average for two: ${restaurant.currency || ''}${restaurant.average_cost_for_two || 'N/A'}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `detail.htm?id=${restaurant.id}`;
        });
        
        resultsContainer.appendChild(card);
    });
}