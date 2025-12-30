import json

DATA_FILE = "data/dreams.json"

CATEGORY_MAP = {
    "Career": "Career & Business",
    "Business": "Career & Business",
    "Finance": "Finance & Wealth",
    "Health": "Health & Wellness",
    "Fitness": "Health & Wellness",
    "Social": "Relationships & Family", # Mapping social to family/relationships
    "Family": "Relationships & Family",
    "Travel": "Travel & Adventure",
    "Personal Growth": "Skills & Knowledge",
    "Skill Development": "Skills & Knowledge",
    "Gardening": "Lifestyle & Hobbies",
    "Cuisine": "Lifestyle & Hobbies",
    "Outdoor Activities": "Lifestyle & Hobbies",
    "Volunteer": "Other", 
    "Other": "Other"
}

def migrate():
    try:
        with open(DATA_FILE, "r") as f:
            dreams = json.load(f)
        
        updated_dreams = []
        for d in dreams:
            old_cat = d.get("category", "Other")
            new_cat = CATEGORY_MAP.get(old_cat, "Other")
            
            new_dream = {
                "id": d.get("id"),
                "title": d.get("title"),
                "category": new_cat,
                "suggested_target_year": d.get("suggested_target_year"),
                "completed": d.get("completed", False)
            }
            updated_dreams.append(new_dream)
            
        with open(DATA_FILE, "w") as f:
            json.dump(updated_dreams, f, indent=2)
            
        print(f"Successfully migrated {len(updated_dreams)} dreams.")
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
