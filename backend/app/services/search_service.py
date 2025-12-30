import numpy as np
import json
import os
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
from .storage_service import storage_service

class SearchService:
    def __init__(self):
        # Using a small, fast model for local execution
        self.model_name = "all-MiniLM-L6-v2"
        print(f"Loading search model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def search_dreams(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        dreams = storage_service.get_all_dreams()
        if not dreams:
            return []

        # Generate query embedding
        query_embedding = self.model.encode(query)

        # Generate embeddings for all dreams (in a real app, these should be cached/stored)
        # For simplicity in this local-first app, we generate them on the fly
        # Optimization: We could store these in the JSON but for now, this is simpler
        results = []
        for dream in dreams:
            dream_text = f"{dream.title} {dream.category}"
            dream_embedding = self.model.encode(dream_text)
            
            similarity = float(self._cosine_similarity(query_embedding, dream_embedding))
            results.append({
                "dream": dream,
                "score": similarity
            })

        # Sort by similarity score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        
        return results[:limit]

search_service = SearchService()
