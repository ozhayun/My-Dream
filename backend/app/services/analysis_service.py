from ..models import DreamInput, DreamCollection, DreamEntry, SMARTGoal, Milestone
import os
import json
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOllama
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
            format="json",
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
            RETURN ONLY JSON.
            """),
            ("user", "{text}")
        ])
        chain = prompt | self.llm | parser
        result = await chain.ainvoke({"text": input_data.text})
        return DreamCollection(**result)

    async def polish_dream(self, dream_title: str) -> SMARTGoal:
        parser = JsonOutputParser(pydantic_object=SMARTGoal)
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            Transform the following dream into a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound).
            Also provide a "polished_title" that is more professional and clear.
            RETURN ONLY JSON matching the SMARTGoal schema.
            """),
            ("user", "Dream: {title}")
        ])
        chain = prompt | self.llm | parser
        result = await chain.ainvoke({"title": dream_title})
        return SMARTGoal(**result)

    async def generate_roadmap(self, dream: DreamEntry, user_age: int = 30) -> AsyncGenerator[str, None]:
        # Implementation for streaming roadmaps
        # Note: ChatOllama streaming needs careful handling of JSON fragments
        # For simplicity in initial implementation, we'll return a batch but simulate streaming
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            Generate a roadmap of 3-5 milestones for this dream. 
            User's current age is {age}. Consider their lifecycle.
            Provide milestones with an 'id', 'title', and 'target_year'.
            RETURN ONLY a JSON array of milestones.
            """),
            ("user", "Dream: {title} (Target Year: {year})")
        ])
        
        # We use astream to get chunks
        async for chunk in self.llm.astream(prompt.format(
            title=dream.title, 
            year=dream.suggested_target_year, 
            age=user_age
        )):
            yield chunk.content

analysis_service = AnalysisService()
