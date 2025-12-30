from ..models import DreamInput, DreamCollection
import os
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

load_dotenv()

class AIService:
    def __init__(self):
        # Default to llama3 if not specified, but user can override in .env
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        print(f"Initializing Ollama with model: {self.model_name} at {self.base_url}")

        self.llm = ChatOllama(
            model=self.model_name,
            base_url=self.base_url,
            format="json", # Force JSON mode for better reliability
            temperature=0.7
        )
        
        self.parser = JsonOutputParser(pydantic_object=DreamCollection)

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are an expert life coach. Extract distinct dreams/goals from the user's text.
            For each dream, categorize it into EXACTLY one of these categories:
            - Career & Business
            - Finance & Wealth
            - Health & Wellness
            - Relationships & Family
            - Travel & Adventure
            - Skills & Knowledge
            - Lifestyle & Hobbies
            - Other
            
            Provide a realistic target year for achieving it based on the nature of the goal (assume current year is 2025).

            RETURN ONLY JSON matching this structure exactly:
            {{
                "dreams": [
                    {{
                        "title": "Short title",
                        "category": "Category Name",
                        "suggested_target_year": 2030
                    }}
                ]
            }}
            """),
            ("user", "{text}")
        ])

        self.chain = self.prompt | self.llm | self.parser

    async def analyze_dreams(self, input_data: DreamInput) -> DreamCollection:
        try:
            print(f"Analyzing dreams: {input_data.text}")
            
            try:
                result = await self.chain.ainvoke({
                    "text": input_data.text
                })
            except Exception as e:
                print(f"LLM Generation Error: {e}")
                # If LLM fails completely, return empty
                return DreamCollection(dreams=[])
            
            # Ensure pydantic model validation
            try:
                return DreamCollection(**result)
            except Exception as e:
                print(f"Validation Error: {e}")
                print(f"Raw Result: {result}")
                # If the LLM returned valid JSON but invalid structure (e.g. missing fields), return empty
                # This handles cases like "aaaa" where LLM might return garbage or empty structure
                return DreamCollection(dreams=[])

        except Exception as e:
            print(f"AI Service Error: {e}")
            raise e

ai_service = AIService()
