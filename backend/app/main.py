from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from typing import List, Optional
import uuid
from .models import DreamInput, DreamCollection, DreamEntry, DreamUpdate, SMARTGoal, Milestone
from .services.analysis_service import analysis_service
from .services.storage_service import storage_service
from .services.search_service import search_service

load_dotenv()

app = FastAPI(title="MyDreams AI Engine")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MyDreams AI Engine is running"}

@app.post("/analyze", response_model=DreamCollection)
async def analyze_dreams(dream: DreamInput):
    try:
        result = await analysis_service.analyze_dreams(dream)
        return result
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Unable to analyze dreams. Please try rephrasing your input.")

@app.post("/dreams/{dream_id}/polish", response_model=SMARTGoal)
async def polish_dream(dream_id: str):
    dream = storage_service.get_dream_by_id(dream_id)
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    try:
        smart_data = await analysis_service.polish_dream(dream.title)
        storage_service.update_dream(dream_id, {
            "is_polished": True,
            "smart_data": smart_data.model_dump(),
            "title": smart_data.polished_title
        })
        return smart_data
    except Exception as e:
        import traceback
        print(f"Error in polish_dream for ID {dream_id}: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dreams/{dream_id}/roadmap")
async def get_roadmap(dream_id: str, age: int = 30):
    dream = storage_service.get_dream_by_id(dream_id)
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    return StreamingResponse(
        analysis_service.generate_roadmap(dream, age),
        media_type="application/json"
    )

@app.get("/search")
async def search_dreams(q: str = Query(..., min_length=1)):
    try:
        results = search_service.search_dreams(q)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dreams/batch", response_model=List[DreamEntry])
async def save_dreams_batch(dreams: List[DreamEntry]):
    try:
        dreams_data = []
        for d in dreams:
            dump = d.model_dump()
            # Ensure ID is a valid UUID string, not a title fragment
            if not dump.get("id") or (isinstance(dump["id"], str) and " " in dump["id"]):
                dump["id"] = str(uuid.uuid4())
            dreams_data.append(dump)
            
        storage_service.save_dreams(dreams_data)
        return [DreamEntry(**d) for d in dreams_data]
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dreams", response_model=List[DreamEntry])
async def get_dreams():
    try:
        data = storage_service.get_all_dreams()
        return data
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dreams/{dream_id}", response_model=DreamEntry)
async def get_dream(dream_id: str):
    dream = storage_service.get_dream_by_id(dream_id)
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    return dream

@app.patch("/dreams/{dream_id}", response_model=DreamEntry)
async def update_dream(dream_id: str, updates: DreamUpdate):
    updated = storage_service.update_dream(dream_id, updates.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Dream not found")
    return updated

@app.delete("/dreams/{dream_id}")
async def delete_dream(dream_id: str):
    success = storage_service.delete_dream(dream_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dream not found")
    return {"message": "Dream deleted"}

