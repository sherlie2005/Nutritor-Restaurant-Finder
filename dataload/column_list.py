import json

# Function to recursively extract all unique keys from JSON data
def get_all_unique_keys(json_data, parent_key="", separator="."):
    keys = set()
    if isinstance(json_data, dict):  # If the data is a dictionary
        for key, value in json_data.items():
            new_key = f"{parent_key}{separator}{key}" if parent_key else key
            keys.add(new_key)  # Add the current key
            if isinstance(value, (dict, list)):  # If the value is nested
                keys.update(get_all_unique_keys(value, new_key, separator))
    elif isinstance(json_data, list):  # If the data is a list
        for item in json_data:
            if isinstance(item, (dict, list)):  # If the item is nested
                keys.update(get_all_unique_keys(item, parent_key, separator))
    return keys

# Load data from JSON file
try:
    with open('data_loader\\Nutritor.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
except FileNotFoundError:
    print("Error: The file 'Nutritor.json' was not found. Please check the file path.")
except json.JSONDecodeError:
    print("Error: The file 'Nutritor.json' contains invalid JSON.")
except UnicodeDecodeError:
    print("Error: The file 'Nutritor.json' could not be decoded. Ensure it is encoded in UTF-8.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
else:
    # Get all unique keys from the JSON data
    unique_keys = get_all_unique_keys(data)
    print("All unique keys in the JSON dataset:")
    for key in sorted(unique_keys):  # Sort keys for better readability
        print(f"- {key}")