import json
import os
from supabase import create_client, Client

# Initialize Supabase client
supabase_url ="https://xcwdminrjdevvyknuiar.supabase.co"
supabase_key ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2RtaW5yamRldnZ5a251aWFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDQ3MjMwOSwiZXhwIjoyMDU2MDQ4MzA5fQ.LTC05Kdol6De0lC551w66Yrk3V7vkDKlAp17hib2kHE"
supabase: Client = create_client(supabase_url, supabase_key)

def load_restaurants_to_supabase():
    try:
        # Read JSON file - update path to your actual JSON file
        with open('data_loader\\Nutritor.json', 'r', encoding='utf-8') as file:
            restaurants = json.load(file)
        
        # Handle both array and single object formats
        restaurants_array = restaurants if isinstance(restaurants, list) else [restaurants]
        
        # Transform each restaurant object to match Supabase schema
        transformed_data = []
        for item in restaurants_array:
            rest = item.get('restaurant', item)
            
            # Get the MongoDB ObjectId if it exists
            _id = item.get('_id', {}).get('$oid', item.get('_id', '')) if isinstance(item.get('_id'), dict) else item.get('_id', '')
            
            # Access nested objects safely
            user_rating = rest.get('user_rating', {})
            location = rest.get('location', {})
            r_data = rest.get('R', {})
            
            transformed_item = {
                '_id': _id,
                'name': rest.get('name'),
                'cuisines': rest.get('cuisines'),
                'location_address': location.get('address'),
                'location_city': location.get('city'),
                'location_latitude': float(location.get('latitude')) if location.get('latitude') else None,
                'location_longitude': float(location.get('longitude')) if location.get('longitude') else None,
                'average_cost_for_two': rest.get('average_cost_for_two'),
                'featured_image': rest.get('featured_image'),
                'user_rating_aggregate_rating': float(user_rating.get('aggregate_rating')) if user_rating.get('aggregate_rating') else None,
                'menu_url': rest.get('menu_url'),
                'photos_url': rest.get('photos_url'),
                'has_online_delivery': rest.get('has_online_delivery') == 1,
                'has_table_booking': rest.get('has_table_booking') == 1,
                
                # Restaurant prefixed fields
                'restaurant_has_online_delivery': rest.get('has_online_delivery'),
                'restaurant_photos_url': rest.get('photos_url'),
                'restaurant_url': rest.get('url'),
                'restaurant_price_range': rest.get('price_range'),
                'restaurant_apikey': rest.get('apikey'),
                'restaurant_user_rating_rating_text': user_rating.get('rating_text'),
                'restaurant_user_rating_rating_color': user_rating.get('rating_color'),
                'restaurant_user_rating_votes': user_rating.get('votes'),
                'restaurant_user_rating_aggregate_rating': float(user_rating.get('aggregate_rating')) if user_rating.get('aggregate_rating') else None,
                'restaurant_r_res_id': r_data.get('res_id'),
                'restaurant_name': rest.get('name'),
                'restaurant_cuisines': rest.get('cuisines'),
                'restaurant_is_delivering_now': rest.get('is_delivering_now'),
                'restaurant_deeplink': rest.get('deeplink'),
                'restaurant_menu_url': rest.get('menu_url'),
                'restaurant_average_cost_for_two': rest.get('average_cost_for_two'),
                'restaurant_book_url': rest.get('book_url'),
                'restaurant_switch_to_order_menu': rest.get('switch_to_order_menu'),
                'restaurant_offers': rest.get('offers'),
                'restaurant_has_table_booking': rest.get('has_table_booking'),
                'restaurant_location_latitude': location.get('latitude'),
                'restaurant_location_address': location.get('address'),
                'restaurant_location_city': location.get('city'),
                'restaurant_location_country_id': location.get('country_id'),
                'restaurant_location_locality_verbose': location.get('locality_verbose'),
                'restaurant_location_city_id': location.get('city_id'),
                'restaurant_location_zipcode': location.get('zipcode'),
                'restaurant_location_longitude': location.get('longitude'),
                'restaurant_location_locality': location.get('locality'),
                'restaurant_featured_image': rest.get('featured_image'),
                'restaurant_zomato_events': rest.get('zomato_events'),
                'restaurant_currency': rest.get('currency'),
                'restaurant_id': rest.get('id'),
                'restaurant_thumb': rest.get('thumb'),
                'restaurant_establishment_types': rest.get('establishment_types'),
                'restaurant_events_url': rest.get('events_url'),
                'currency': rest.get('currency')
            }
            
            transformed_data.append(transformed_item)
        
        # Insert transformed data into Supabase
        response = supabase.table('restaurants').insert(transformed_data).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Error inserting data: {response.error}")
        else:
            print(f"Successfully inserted {len(transformed_data)} restaurants")
            
    except Exception as e:
        print(f"Error processing data: {str(e)}")

if __name__ == "__main__":
    load_restaurants_to_supabase()