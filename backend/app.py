from flask import Flask, request, jsonify
from supabase import create_client
import os
from flask_cors import CORS
import numpy as np
from PIL import Image
import tensorflow as tf
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase setup
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

# Load pre-trained model for image recognition (MobileNetV2)
model = tf.keras.applications.MobileNetV2(weights="imagenet")

# Helper function to calculate distance between two coordinates
def calculate_distance(lat1, lon1, lat2, lon2):
    # Simple Euclidean distance (for demonstration purposes)
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5 * 111  # Rough conversion to km

# API Endpoints

# 1. Get Restaurant by ID
@app.route("/api/restaurants/<int:restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):
    print(f"Fetching restaurant with ID: {restaurant_id}")  # Log the restaurant ID
    try:
        response = supabase.table("restaurants").select("*").eq("id", restaurant_id).execute()
        if len(response.data) > 0:
            print("Restaurant data found:", response.data[0])  # Log the restaurant data
            return jsonify(response.data[0])
        print("Restaurant not found")  # Log if no data is found
        return jsonify({"error": "Restaurant not found"}), 404
    except Exception as e:
        logging.error(f"Error in get_restaurant: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

# 2. Get List of Restaurants with Pagination
@app.route("/api/restaurants", methods=["GET"])
def get_restaurants():
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        start = (page - 1) * per_page
        end = start + per_page - 1
        
        print(f"Page: {page}, Per Page: {per_page}, Start: {start}, End: {end}")  # Debugging
        
        # Fetch total count of restaurants
        total_count_response = supabase.table("restaurants").select("count", count="exact").execute()
        total_count = total_count_response.count if hasattr(total_count_response, 'count') else 0
        
        print(f"Total Count: {total_count}")  # Debugging
        
        # Fetch paginated restaurants
        response = supabase.table("restaurants").select("*").order("id").range(start, end).execute()
        
        return jsonify({
            "data": response.data,
            "page": page,
            "per_page": per_page,
            "total": total_count  # Return total count for pagination
        })
    except Exception as e:
        logging.error(f"Error in get_restaurants: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

# 3. Search Restaurants by Location
@app.route("/api/restaurants/search/location", methods=["GET"])
def search_by_location():
    try:
        lat = request.args.get("latitude", type=float)
        lng = request.args.get("longitude", type=float)
        radius = request.args.get("radius", 3, type=float)  # Default radius is 3 km
        
        print(f"Latitude: {lat}, Longitude: {lng}, Radius: {radius}")  # Debugging
        
        response = supabase.table("restaurants").select("*").execute()
        
        nearby_restaurants = []
        for restaurant in response.data:
            # Use the correct column names from Supabase
            r_lat = float(restaurant.get("location_latitude", 0))
            r_lng = float(restaurant.get("location_longitude", 0))
            distance = calculate_distance(lat, lng, r_lat, r_lng)
            
            print(f"Restaurant: {restaurant.get('restaurant_name', 'Unknown')}, Distance: {distance}")  # Debugging
            
            if distance <= radius:
                restaurant["distance"] = distance
                nearby_restaurants.append(restaurant)
        
        return jsonify(nearby_restaurants)
    except Exception as e:
        logging.error(f"Error in search_by_location: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

# 4. Search Restaurants by Image (Cuisine Recognition)
@app.route("/api/restaurants/search/image", methods=["POST"])
def search_by_image():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image = request.files["image"]
        img = Image.open(image)
        img = img.resize((224, 224))  # Resize for MobileNetV2
        img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        
        predictions = model.predict(img_array)
        decoded_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=3)
        food_items = [item[1] for item in decoded_predictions[0] if item[2] > 0.1]  # Filter by confidence
        
        print(f"Decoded Predictions: {decoded_predictions}")  # Debugging
        print(f"Food Items: {food_items}")  # Debugging
        
        response = supabase.table("restaurants").select("*").execute()
        matching_restaurants = []
        
        for restaurant in response.data:
            # Use the correct column name from Supabase
            cuisines = restaurant.get("cuisines", "").lower()
            print(f"Restaurant Cuisines: {cuisines}")  # Debugging
            if any(food.lower() in cuisines for food in food_items):
                print(f"Match found for restaurant: {restaurant.get('restaurant_name', 'Unknown')}")  # Debugging
                matching_restaurants.append(restaurant)
        
        print(f"Matching Restaurants: {matching_restaurants}")  # Debugging
        return jsonify(matching_restaurants)
    except Exception as e:
        logging.error(f"Error in search_by_image: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

# 5. Filter Restaurants (Optional)
@app.route("/api/restaurants/filter", methods=["GET"])
def filter_restaurants():
    try:
        country = request.args.get("city")
        min_cost = request.args.get("min_cost", type=float)
        max_cost = request.args.get("max_cost", type=float)
        cuisines = request.args.get("cuisines")
        
        query = supabase.table("restaurants").select("*")
        
        if country:
            query = query.eq("location_city", country)
        if min_cost:
            query = query.gte("average_cost_for_two", min_cost)
        if max_cost:
            query = query.lte("average_cost_for_two", max_cost)
        
        response = query.execute()
        
        filtered_data = response.data
        if cuisines:
            cuisines_list = cuisines.lower().split(",")
            filtered_data = [r for r in filtered_data if any(c.strip() in r.get("restaurant_cuisines", "").lower() for c in cuisines_list)]
        
        return jsonify(filtered_data)
    except Exception as e:
        logging.error(f"Error in filter_restaurants: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)