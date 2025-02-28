// Global variables
let currentPage = 1;
const perPage = 10; // Number of items per page
let totalPages = 1;
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const restaurantList = document.getElementById('restaurant-list');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const filterForm = document.getElementById('filter-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadRestaurants);
prevPageBtn.addEventListener('click', goToPrevPage);
nextPageBtn.addEventListener('click', goToNextPage);
filterForm.addEventListener('submit', applyFilters);

// Functions
async function loadRestaurants(page = 1, filters = {}) {
    restaurantList.innerHTML = '<div class="loading">Loading restaurants...</div>';
    
    try {
        let url = `${API_BASE_URL}/restaurants?page=${page}&per_page=${perPage}`;
        
        if (Object.keys(filters).length > 0) {
            url = `${API_BASE_URL}/restaurants/filter?`;
            for (const [key, value] of Object.entries(filters)) {
                if (value) {
                    url += `${key}=${encodeURIComponent(value)}&`;
                }
            }
        }
        
        const response = await fetch(url);
        const data = await response.json();
        console.log("API Response:", data); // Log the API response
        
        if (response.ok) {
            displayRestaurants(data);
            updatePagination(page, data.total); // Pass total count to updatePagination
        } else {
            throw new Error('Failed to load restaurants');
        }
    } catch (error) {
        console.error('Error:', error);
        restaurantList.innerHTML = `<div class="error">Error loading restaurants: ${error.message}</div>`;
    }
}

function displayRestaurants(data) {
    const restaurants = Array.isArray(data) ? data : data.data;
    
    if (restaurants.length === 0) {
        restaurantList.innerHTML = '<div class="no-results">No restaurants found matching your criteria.</div>';
        return;
    }
    
    restaurantList.innerHTML = '';
    
    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="content">
                <h3>${restaurant.name || 'Unnamed Restaurant'}</h3>
                <div class="cuisines">${restaurant.cuisines || 'Various Cuisines'}</div>
                <div class="location">${restaurant.location_address || ''}, ${restaurant.location_city || ''}</div>
                <div class="price">Average for two: ${restaurant.currency || ''}${restaurant.average_cost_for_two || 'N/A'}</div>
                <div class="rating">Rating: ${restaurant.user_rating_aggregate_rating || 'No ratings'}/5</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `detail.htm?id=${restaurant.id}`;
        });
        
        restaurantList.appendChild(card);
    });
}

function updatePagination(page, total) {
    currentPage = page;
    totalPages = Math.ceil(total / perPage) || 1;
    
    // Update the page info text
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Enable/disable the Previous button
    prevPageBtn.disabled = currentPage <= 1;
    
    // Enable/disable the Next button
    nextPageBtn.disabled = currentPage >= totalPages;
}

function goToPrevPage() {
    if (currentPage > 1) {
        console.log("Going to previous page:", currentPage - 1);
        loadRestaurants(currentPage - 1, getFilterValues());
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        console.log("Going to next page:", currentPage + 1);
        loadRestaurants(currentPage + 1, getFilterValues());
    }
}

function applyFilters(event) {
    event.preventDefault();
    loadRestaurants(1, getFilterValues());
}

function getFilterValues() {
    return {
        country: document.getElementById('city').value,
        min_cost: document.getElementById('min-cost').value,
        max_cost: document.getElementById('max-cost').value,
        cuisines: document.getElementById('cuisines').value
    };
}