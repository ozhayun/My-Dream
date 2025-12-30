from ..models import DreamEntry
import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path

DATA_FILE = Path("data/dreams.json")

class StorageService:
    def __init__(self):
        self._ensure_data_file()

    def _ensure_data_file(self):
        if not DATA_FILE.parent.exists():
            DATA_FILE.parent.mkdir(parents=True)
        if not DATA_FILE.exists():
            with open(DATA_FILE, "w") as f:
                json.dump([], f)

    def load_dreams_raw(self) -> List[Dict[str, Any]]:
        with open(DATA_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []

    def get_all_dreams(self) -> List[DreamEntry]:
        raw = self.load_dreams_raw()
        return [DreamEntry(**d) for d in raw]

    def get_dream_by_id(self, dream_id: str) -> Optional[DreamEntry]:
        dreams = self.get_all_dreams()
        for d in dreams:
            if d.id == dream_id:
                return d
        return None

    def save_dreams(self, dreams: List[Dict[str, Any]]):
        current_raw = self.load_dreams_raw()
        current_raw.extend(dreams)
        with open(DATA_FILE, "w") as f:
            json.dump(current_raw, f, indent=2)

    def update_dream(self, dream_id: str, updates: Dict[str, Any]) -> Optional[DreamEntry]:
        raw_dreams = self.load_dreams_raw()
        updated_raw = None
        
        for d in raw_dreams:
            if d.get("id") == dream_id:
                # Update but preserve ID
                d.update({k: v for k, v in updates.items() if v is not None})
                updated_raw = d
                break
        
        if updated_raw:
            with open(DATA_FILE, "w") as f:
                json.dump(raw_dreams, f, indent=2)
            return DreamEntry(**updated_raw)
                
        return None

    def delete_dream(self, dream_id: str) -> bool:
        raw_dreams = self.load_dreams_raw()
        new_dreams = [d for d in raw_dreams if d.get("id") != dream_id]
        
        if len(new_dreams) < len(raw_dreams):
            with open(DATA_FILE, "w") as f:
                json.dump(new_dreams, f, indent=2)
            return True
        return False

storage_service = StorageService()

