import re
from ..models import DreamInput, DreamCollection, DreamEntry, SMARTGoal, Milestone
import os
import json
import numpy as np
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from typing import AsyncGenerator, List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA

load_dotenv()

class AnalysisService:
    def __init__(self):
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        self.llm = ChatOllama(
            model=self.model_name,
            base_url=self.base_url,
            temperature=0.7
        )
        
        # Initialize embedding model lazily or here? 
        # Using a small, fast model for semantic search/clustering
        try:
            self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Failed to load SentenceTransformer: {e}")
            self.embedder = None

    async def analyze_dreams(self, input_data: DreamInput) -> DreamCollection:
        parser = JsonOutputParser(pydantic_object=DreamCollection)
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are an expert life coach. Extract distinct dreams/goals from the user's text.
            Categorize each into one of: Career & Business, Finance & Wealth, Health & Wellness, 
            Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other.
            Assign a realistic target year (current year is 2025).
            RETURN ONLY JSON.
            """),
            ("user", "{text}")
        ])
        chain = prompt | self.llm | parser
        result = await chain.ainvoke({"text": input_data.text})
        return DreamCollection(**result)

    async def polish_dream(self, dream_title: str) -> SMARTGoal:
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are a master life strategist. Transform the user's dream into a comprehensive SMART goal.
            Be extremely detailed and specific for each field. 
            
            Return a JSON object with these EXACT keys (lower case):
            - 'specific'
            - 'measurable'
            - 'achievable'
            - 'relevant'
            - 'time_bound'
            - 'polished_title' (max 5 words)

            RETURN ONLY THE JSON OBJECT. NO MARKDOWN. NO EXPLANATIONS.
            """),
            ("user", "Dream: {title}")
        ])
        chain = prompt | self.llm
        try:
            raw_result = await chain.ainvoke({"title": dream_title})
            content = str(raw_result.content) if hasattr(raw_result, 'content') else str(raw_result)
            content = content.strip()
            
            # Find JSON block
            # If no closing brace is found, it might be truncated
            json_match = re.search(r'\{[\s\S]*', content)
            if not json_match:
                print(f"No JSON start found in: {content}")
                return SMARTGoal(polished_title=dream_title)
            
            json_str = json_match.group()
            
            # Helper to try and fix unclosed JSON
            def try_parse_json(s):
                for i in range(10): # Try adding up to 10 closing braces
                    try:
                        return json.loads(s + ("}" * i))
                    except:
                        continue
                return None

            data = try_parse_json(json_str)
            if not data:
                print(f"Failed to parse JSON even with fixes: {json_str}")
                return SMARTGoal(polished_title=dream_title)
            
            # Handle potential case-insensitivity from LLM
            normalized = {}
            for k, v in data.items():
                normalized[k.lower().replace("-", "_")] = v
            
            # Map common variations
            mappings = {
                "specific": normalized.get("specific", ""),
                "measurable": normalized.get("measurable", ""),
                "achievable": normalized.get("achievable", ""),
                "relevant": normalized.get("relevant", ""),
                "time_bound": normalized.get("time_bound", normalized.get("timebound", "")),
                "polished_title": normalized.get("polished_title", normalized.get("title", dream_title))
            }
            
            return SMARTGoal(**mappings)
        except Exception as e:
            print(f"Failed to polish dream: {e}")
            return SMARTGoal(polished_title=dream_title)

    async def generate_roadmap(self, dream: DreamEntry, user_age: int = 30) -> AsyncGenerator[str, None]:
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are a strategic career and life planner. Generate a roadmap of 3-5 concrete milestones for the following dream.
            User's current age is {age}. The target year is {year}.
            
            For each milestone, provide:
            - 'id': A unique string (use uuid logic or short slug).
            - 'title': A clear, actionable achievement.
            - 'target_year': A realistic year for this milestone (between current year and {year}).
            
            Format the output as a PURE JSON ARRAY of milestone objects. 
            NO EXPLANATIONS, NO MARKDOWN, JUST THE ARRAY.
            """),
            ("user", "Dream: {title} (Overall Target Year: {year})")
        ])
        
        # We use astream to get chunks
        async for chunk in self.llm.astream(prompt.format(
            title=dream.title, 
            year=dream.suggested_target_year, 
            age=user_age
        )):
            yield chunk.content

    def get_galaxy_points(self, dreams: List[DreamEntry]) -> List[Dict[str, Any]]:
        if not dreams:
            return []
        
        if not self.embedder:
            # Fallback if model failed to load
            return [{
                "id": d.id,
                "title": d.title,
                "category": d.category,
                "x": np.random.uniform(-10, 10),
                "y": np.random.uniform(-10, 10),
                "z": np.random.uniform(-10, 10)
            } for d in dreams]

        # 1. Prepare texts for embedding
        texts = [f"{d.category}: {d.title}" for d in dreams]
        
        # 2. Generate embeddings
        embeddings = self.embedder.encode(texts)
        
        # 3. Dimensionality Reduction (PCA to 3D)
        n_samples = len(dreams)
        if n_samples > 1:
            try:
                # Use as many components as possible up to 3
                n_comp = min(3, n_samples - 1)
                pca = PCA(n_components=n_comp)
                reduced = pca.fit_transform(embeddings)
                
                # Pad with zeros if we have fewer than 3 components
                if reduced.shape[1] < 3:
                    padding = np.zeros((n_samples, 3 - reduced.shape[1]))
                    reduced = np.hstack([reduced, padding])
            except Exception as e:
                print(f"PCA logic failed, falling back to random: {e}")
                reduced = np.random.uniform(-5, 5, (n_samples, 3))
        else:
            # Single dream centered at origin
            reduced = np.zeros((n_samples, 3))

        # 4. Map back to JSON structure
        MAX_GALAXY_RADIUS = 50.0
        results = []
        
        # Calculate max distance for normalization
        max_dist = 0.0
        for coords in reduced:
            dist = np.linalg.norm(coords)
            if dist > max_dist:
                max_dist = dist
        
        # Scale to fit within MAX_GALAXY_RADIUS
        scale_factor = (MAX_GALAXY_RADIUS / max_dist) if max_dist > 0.01 else 1.0

        for i, d in enumerate(dreams):
            coords = reduced[i]
            results.append({
                "id": str(d.id),
                "title": str(d.title),
                "category": str(d.category),
                "completed": bool(d.completed),
                "x": float(coords[0] * scale_factor),
                "y": float(coords[1] * scale_factor),
                "z": float(coords[2] * scale_factor)
            })
            
        return results

analysis_service = AnalysisService()
