import json
from app.models import DreamEntry
from pydantic import ValidationError

DATA_FILE = "data/dreams.json"

try:
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} items.")
    
    for idx, item in enumerate(data):
        try:
            DreamEntry(**item)
        except ValidationError as e:
            print(f"Error in item {idx} (ID: {item.get('id')}): {e}")
            
    print("Validation check complete.")

except Exception as e:
    print(f"General error: {e}")
