import openai
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY


async def get_context_with_openai(query: str) -> str:
    """
    Get context for the user's question using OpenAI.
    This can be used to retrieve relevant family planning information.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a family planning assistant. Provide brief, relevant context for family planning questions."
                },
                {
                    "role": "user",
                    "content": f"Provide context for this family planning question: {query}"
                }
            ],
            temperature=0.3,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error getting context: {e}")
        return "General family planning information available."
