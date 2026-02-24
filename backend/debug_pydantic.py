import json
from pathlib import Path
from app.models import DreamEntry
from pydantic import ValidationError

_BACKEND_ROOT = Path(__file__).resolve().parent
DATA_FILE = _BACKEND_ROOT / "data" / "dreams.json"

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
