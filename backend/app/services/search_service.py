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

        # Optimization: Batch encode all dreams at once
        dream_texts = [f"{d.title} {d.category}" for d in dreams]
        dream_embeddings = self.model.encode(dream_texts)

        results = []
        for i, dream in enumerate(dreams):
            similarity = float(self._cosine_similarity(query_embedding, dream_embeddings[i]))
            results.append({
                "dream": dream,
                "score": similarity
            })

        # Sort by similarity score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        
        return results[:limit]

search_service = SearchService()
