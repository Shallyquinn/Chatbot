from typing import Union
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import openai
import Levenshtein
import openpyxl
from difflib import SequenceMatcher
import difflib
import pandas as pd
from pydantic import BaseModel
import os

from config import OPENAI_API_KEY
openai.api_key = OPENAI_API_KEY

from utils import get_context_with_openai

TEMPERATURE = 0.25
MAX_TOKENS = 350
STOP_SEQUENCES = ["==="]
TOP_P = 1
TOP_K = 1
BEST_OF = 1
FREQUENCY_PENALTY = 0
PRESENCE_PENALTY = 0

app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data files with error handling
try:
    file_path = './data/partner_clinic.xlsx'
    workbook = openpyxl.load_workbook(file_path)
except Exception as e:
    print(f"Warning: Could not load clinic data: {e}")
    workbook = None

try:
    lgas = pd.read_csv("./data/lgas.csv", sep=",")
except Exception as e:
    print(f"Warning: Could not load LGAs data: {e}")
    lgas = pd.DataFrame()

try:
    clinics_df = pd.read_csv("./data/clinics.csv").fillna("")
except Exception as e:
    print(f"Warning: Could not load clinics data: {e}")
    clinics_df = pd.DataFrame()


def gpt_without_functions(model="gpt-4o",
                          stream=False,
                          messages=None,
                          temperature=TEMPERATURE,
                          stop=STOP_SEQUENCES):
    """ GPT model without function call. Old SDK style. """
    if messages is None:
        messages = []
    return openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=MAX_TOKENS,
        top_p=TOP_P,
        frequency_penalty=FREQUENCY_PENALTY,
        presence_penalty=PRESENCE_PENALTY,
        stream=stream,
        stop=stop
    )


def clean_text(text):
    text = text.replace("-", " ")
    text = text.replace("/", " ")
    text = text.replace("'", "")
    text = text.replace("(", "")
    text = text.replace(")", "")
    return text.lower()


def get_top_n_similar_strings_by_levenshtein(strings, user_input, n=3):
    result = []
    for string in strings:
        if clean_text(user_input) in clean_text(string).split():
            result.append(string)
    if result:
        n = max(0, n - len(result))
    similarity_scores = [
        (string, Levenshtein.distance(clean_text(string), clean_text(user_input)))
        for string in strings if string not in result
    ]
    similarity_scores.sort(key=lambda x: x[1])
    top_n_similar_strings = similarity_scores[:n]
    return result + [item[0] for item in top_n_similar_strings]


PROMPT = """
You are a smart AI assistant that helps people answer questions about family planning methods. You must answer only in the user's own language or dialect: English, Nigerian Pidgin, Yoruba, Hausa, or Igbo.

Goals
- Always reply in the same language or dialect the user used. Do not switch to English unless the user used English.
- Be kind and empathetic. Use a friendly tone suited to the chosen language or dialect.
- Keep answers short, 3 to 5 sentences.
- Handle misspellings, slang, and mixed wording. If the user mixes languages, choose the predominant one. If a local term lacks an easy equivalent, keep the English term but keep the rest of the answer in the user's language.
- Do not ask follow-up questions.

What you can answer
- Family planning, contraceptives, and sexual health.

Special outputs
- If you cannot answer from the provided DATA and general knowledge of family planning, output exactly: NO ANSWER
- If the question is unrelated to sexual health or family planning, output exactly: NO ANSWER
- If the user clearly says they have no more questions, output exactly: COMPLETE

Thinking rule
- You may think in any language internally, but your final output must be only in the user's language. Do not explain your reasoning.

Style and length
- 3 to 5 sentences. Clear and reassuring. No extra headers or lists.

DATA
Use the following as factual context in addition to general knowledge:
`{context}`

Examples
User: What is Postinor?
Assistant: Postinor is an emergency contraceptive pill that helps prevent pregnancy after unprotected sex. It works best if taken within 72 hours. It is for emergencies, not regular family planning.

User: Wetin be Postinor?
Assistant: Postinor na emergency contraceptive wey fit stop belle after unprotected sex. E dey work pass if you take am within 72 hours. No be everyday family planning, na for emergency.

User: Kini Postinor?
Assistant: Postinor oogun pajawiri ni fun idena oyun lẹyin ibalopọ lai aabo. O maa n ṣiṣẹ dara julọ ti a ba mu un laarin wakati 72. Kii ṣe fun lilo lojoojumọ, fun pajawiri nikan.

User: Menene Postinor?
Assistant: Postinor maganin kariya ne na gaggawa don hana ɗaukar ciki bayan jima'i ba tare da kariya ba. Yana aiki sosai idan an sha shi cikin awa 72. Ba a amfani da shi kullum, na gaggawa ne kawai.

User: Gịnị bụ Postinor?
Assistant: Postinor bụ ọgwụ mberede iji gbochie ime mgbe e nwere mmekọahụ na-enweghị nchebe. Ọ na-arụ ọrụ nke ọma ma a ṅụọ ya n'ime awa 72. Ọ bụghị maka ojoo kwa ụbọchị, maka mberede ka ọ dị.

User: No more questions
Assistant: COMPLETE

User: What colour is the sky?
Assistant: NO ANSWER
"""


@app.get("/")
def read_root():
    return {"message": "Family Planning AI Service is running"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Family Planning AI"}


class GPTRequest(BaseModel):
    memory: dict


@app.post("/answer/", tags=["answer"])
async def answer(request: GPTRequest):
    try:
        memory = request.memory
        
        if "user" not in memory:
            return JSONResponse(
                status_code=400,
                content={"error": "Missing 'user' field in memory object"}
            )
        
        user_question = memory["user"]
        
        # Get context from data or general knowledge
        try:
            context = await get_context_with_openai(query=user_question)
        except Exception as e:
            print(f"Warning: Could not get context: {e}")
            context = "data not available"

        # Strong language lock
        system_content = (
            "IMPORTANT: Reply only in the user's language. Do not use English unless the user did.\n\n"
            + PROMPT.format(context=context)
        )

        # Call GPT without prior assistant turns
        response = gpt_without_functions(
            model='gpt-4o',
            stream=False,
            messages=[
                {'role': 'system', 'content': system_content},
                {'role': 'user', 'content': user_question},
            ],
        )
        response_message = response.choices[0].message.content.strip()
        return JSONResponse(content={"response": response_message})
    
    except Exception as e:
        print(f"Error in /answer/ endpoint: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "response": "I apologize, but I'm having trouble processing your question right now. Please try again."}
        )


class LGARequest(BaseModel):
    user_input: str


@app.post("/predict_lga/", tags=["predict_lga"])
async def predict_lga(request: LGARequest):
    try:
        user_input = request.user_input
        
        if lgas.empty:
            return JSONResponse(content={"response": [], "message": "LGA data not available"})
        
        lga2state = {}
        for _, row in lgas.iterrows():
            lga2state[row["LGA"]] = row["State"]
        
        print(f"Number of lga states: {len(lga2state.keys())}")

        response_message = get_top_n_similar_strings_by_levenshtein(
            lga2state.keys(), user_input, n=5)
        return JSONResponse(content={"response": response_message})
    
    except Exception as e:
        print(f"Error in /predict_lga/ endpoint: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "response": []}
        )


class ClinicRequest(BaseModel):
    lga: str
    city: str


@app.post("/refer_to_clinic/", tags=["refer_to_clinic"])
async def refer_to_clinic(request: ClinicRequest):
    try:
        lga = request.lga
        city = request.city
        
        print('!!! Clinic suggestion LGA:', lga)
        print('!!! Clinic suggestion city:', city)

        if clinics_df.empty:
            return JSONResponse(content={"response": "Clinic data not available", "status": "empty"})

        text = ""
        subset = clinics_df[
            (clinics_df["Town/City"].str.lower() == city.lower()) &
            (clinics_df["LGA"].str.lower() == lga.lower())
        ]

        for _, row in subset.iterrows():
            text += (
                f"📓 Clinic Name: {row['Clinic name']}\n"
                f"📍 Address: {row['LGA']}, {row['Town/City']}, {row['Address']}"
            )
            if isinstance(row['Popular Landmark'], str) and row['Popular Landmark'].strip():
                text += f"\n✨Popular Landmark: {row['Popular Landmark']}\n\n"
            else:
                text += "\n\n"

        print('!!! Clinic suggestion:', text)
        if text:
            return JSONResponse(content={"response": text})
        else:
            return JSONResponse(content={"response": "EMPTY"})
    
    except Exception as e:
        print(f"Error in /refer_to_clinic/ endpoint: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "response": "Error fetching clinic information"}
        )


class TownRequest(BaseModel):
    lga: str


@app.post("/get_town_from_lga/", tags=["get_town_from_lga"])
async def get_town_from_lga(request: TownRequest):
    try:
        lga = request.lga
        print('!!! Town suggestion per LGA:', lga)

        if clinics_df.empty:
            return JSONResponse(content={"response": [], "status": "empty"})

        cities = []
        for _, row in clinics_df[clinics_df["LGA"].str.lower() == lga.lower()].iterrows():
            if isinstance(row['Town/City'], str) and row['Town/City'].strip():
                cities.append(row['Town/City'])

        print('!!! Cities suggestion:', cities)

        cities = sorted(list(set(cities)))

        if cities:
            return JSONResponse(content={"response": cities})
        else:
            return JSONResponse(content={"response": "EMPTY"})
    
    except Exception as e:
        print(f"Error in /get_town_from_lga/ endpoint: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "response": []}
        )


@app.post("/get_town_from_lga_messenger/", tags=["get_town_from_lga_messenger"])
async def get_town_from_lga_messenger(request: TownRequest):
    try:
        lga = request.lga
        print('!!! Town suggestion per LGA:', lga)

        if clinics_df.empty:
            return JSONResponse(content={"town": [], "town_text": "EMPTY"})

        cities = []
        for _, row in clinics_df[clinics_df["LGA"].str.lower() == lga.lower()].iterrows():
            if isinstance(row['Town/City'], str) and row['Town/City'].strip():
                cities.append(row['Town/City'])

        print('!!! Cities suggestion:', cities)

        cities = sorted(list(set(cities)))

        if cities:
            cities_text = ""
            for index, value in enumerate(cities):
                cities_text += f"{index}: {value}\n"
            return JSONResponse(content={"town": cities, "town_text": cities_text})
        else:
            return JSONResponse(content={"town": "EMPTY", "town_text": "EMPTY"})
    
    except Exception as e:
        print(f"Error in /get_town_from_lga_messenger/ endpoint: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "town": [], "town_text": ""}
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
