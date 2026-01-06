import re
from ..models import DreamInput, DreamCollection, DreamEntry, SMARTGoal, Milestone
import os
import json
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from typing import AsyncGenerator

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

    async def analyze_dreams(self, input_data: DreamInput) -> DreamCollection:
        parser = JsonOutputParser(pydantic_object=DreamCollection)
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are an expert life coach. Extract distinct dreams/goals from the user's text.
            Categorize each into one of: Career & Business, Finance & Wealth, Health & Wellness, 
            Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other.
            Assign a realistic target year (current year is 2025).
            
            Return a JSON object with this EXACT structure:
            {{
              "dreams": [
                {{
                  "title": "Dream title here",
                  "category": "Career & Business",
                  "suggested_target_year": 2026
                }}
              ]
            }}
            
            RETURN ONLY JSON. NO MARKDOWN. NO EXPLANATIONS.
            """),
            ("user", "{text}")
        ])
        chain = prompt | self.llm | parser
        try:
            result = await chain.ainvoke({"text": input_data.text})
            return DreamCollection(**result)
        except Exception as e:
            # Check if it's a connection error
            error_str = str(e).lower()
            if "connection" in error_str or "refused" in error_str or "timeout" in error_str:
                raise ConnectionError(f"Cannot connect to Ollama at {self.base_url}. Please make sure Ollama is running and the model '{self.model_name}' is available.")
            # Try to handle malformed LLM output
            try:
                # Get raw output and try to transform it
                raw_chain = prompt | self.llm
                raw_result = await raw_chain.ainvoke({"text": input_data.text})
                content = str(raw_result.content) if hasattr(raw_result, 'content') else str(raw_result)
                content = content.strip()
                
                # Remove markdown code blocks if present
                if content.startswith("```"):
                    content = re.sub(r'^```(?:json)?\s*', '', content)
                    content = re.sub(r'\s*```$', '', content)
                
                try:
                    data = json.loads(content)
                except json.JSONDecodeError:
                    raise ValueError("LLM returned invalid JSON. Please try rephrasing your input.")
                
                # Handle case where LLM returns dreams grouped by category
                if "dreams" not in data and isinstance(data, dict):
                    dreams_list = []
                    for category, items in data.items():
                        if isinstance(items, list):
                            for item in items:
                                if isinstance(item, dict):
                                    # Normalize the item
                                    dream = {
                                        "title": item.get("title", item.get("Title", "")),
                                        "category": category if category in ["Career & Business", "Finance & Wealth", "Health & Wellness", 
                                                                           "Relationships & Family", "Travel & Adventure", 
                                                                           "Skills & Knowledge", "Lifestyle & Hobbies", "Other"] 
                                                          else "Other",
                                        "suggested_target_year": item.get("suggested_target_year", 
                                                                          item.get("target_year", 
                                                                                  item.get("Target Year", 
                                                                                          item.get("year", 2026))))
                                    }
                                    if dream["title"]:
                                        dreams_list.append(dream)
                    data = {"dreams": dreams_list}
                
                # Handle case where data is already a list
                if isinstance(data, list):
                    data = {"dreams": data}
                
                # Ensure all dreams have required fields
                if "dreams" in data:
                    valid_dreams = []
                    for dream in data["dreams"]:
                        if not isinstance(dream, dict):
                            continue
                        # Normalize field names
                        if "Title" in dream:
                            dream["title"] = dream.pop("Title")
                        if "target_year" in dream or "Target Year" in dream:
                            dream["suggested_target_year"] = dream.pop("target_year", dream.pop("Target Year", 2026))
                        if "Category" in dream:
                            dream["category"] = dream.pop("Category")
                        if "suggested_target_year" not in dream:
                            dream["suggested_target_year"] = 2026
                        if "category" not in dream:
                            dream["category"] = "Other"
                        # Ensure title exists
                        if "title" in dream and dream["title"]:
                            valid_dreams.append(dream)
                    
                    if not valid_dreams:
                        raise ValueError("No valid dreams found in the AI response. Please try rephrasing your input with more specific goals.")
                    
                    data["dreams"] = valid_dreams
                else:
                    raise ValueError("AI response missing 'dreams' field. Please try rephrasing your input.")
                
                return DreamCollection(**data)
            except Exception as fix_error:
                raise ValueError("Unable to parse dream analysis. Please try rephrasing your input.")

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

analysis_service = AnalysisService()
