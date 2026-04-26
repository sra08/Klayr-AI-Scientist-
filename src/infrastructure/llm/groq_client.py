import os
from groq import AsyncGroq
from src.domain.ports.llm_client import ILLMClient

class GroqClient(ILLMClient):
    def __init__(self):
        self._client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

    async def complete(self, system: str, prompt: str) -> str:
        response = await self._client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=4000,
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": prompt}
            ]
        )
        return response.choices[0].message.content
