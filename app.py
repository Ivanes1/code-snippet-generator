from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import json
import os

from gpt_provider import GPTProvider

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

code_generators = {}
tests_generators = {}

if not os.path.exists(f"data.json"):
    with open(f"data.json", "w") as f:
        json.dump({}, f)

with open(f"data.json", "r") as f:
    data = json.load(f)
    for key in data:
        code_generators[key] = GPTProvider(
            assistant="code_generator", context=data[key].get("code", [])
        )
        tests_generators[key] = GPTProvider(
            assistant="tests_generator", context=data[key].get("tests", [])
        )


class CodeRequest(BaseModel):
    prompt: str
    snippet_id: str
    keep_context: bool = False


class TestsRequest(BaseModel):
    code: str
    snippet_id: str


@app.get("/snippet/{snippet_id}")
async def get_snippet(snippet_id: str):
    with open(f"data.json", "r") as f:
        data = json.load(f)

    last_code = (
        json.loads(data[snippet_id]["code"][-1]["message"])
        if data.get(snippet_id) and data[snippet_id].get("code")
        else {"code": "", "language": None}
    )
    last_tests = (
        json.loads(data[snippet_id]["tests"][-1]["message"])
        if data.get(snippet_id) and data[snippet_id].get("tests")
        else {"tests": []}
    )
    return {"codeData": last_code, "testsData": last_tests}


@app.post("/generate_code")
async def generate_code(code_request: CodeRequest):
    if code_request.keep_context:
        # Use the existing context or start a new conversation
        gpt = code_generators.get(code_request.snippet_id) or GPTProvider(
            assistant="code_generator",
        )
        response = gpt.send_message(
            prompt=code_request.prompt,
        )
        response = (
            response
            if "code" in response
            else {"code": "# Failed to generate the code", "language": "python"}
        )

        # Save the conversation context
        with open(f"data.json", "r") as f:
            data = json.load(f)

        if code_request.snippet_id not in data:
            data[code_request.snippet_id] = {}
        data[code_request.snippet_id]["code"] = data[code_request.snippet_id].get(
            "code", []
        ) + [
            {"role": "user", "message": code_request.prompt},
            {"role": "assistant", "message": json.dumps(response)},
        ]

        with open(f"data.json", "w") as f:
            json.dump(data, f)
    else:
        # Start a new conversation
        code_generators[code_request.snippet_id] = GPTProvider(
            assistant="code_generator",
        )
        tests_generators[code_request.snippet_id] = GPTProvider(
            assistant="tests_generator",
        )
        gpt = code_generators[code_request.snippet_id]
        response = gpt.send_message(
            prompt=code_request.prompt,
        )
        response = (
            response
            if "code" in response
            else {"code": "# Failed to generate the code", "language": "python"}
        )

        # Save the new conversation context
        with open(f"data.json", "r") as f:
            data = json.load(f)

        data[code_request.snippet_id] = {
            "code": [
                {"role": "user", "message": code_request.prompt},
                {"role": "assistant", "message": json.dumps(response)},
            ],
        }

        with open(f"data.json", "w") as f:
            json.dump(data, f)

    return response


@app.post("/generate_tests")
async def generate_tests(tests_request: TestsRequest):
    gpt = tests_generators.get(tests_request.snippet_id) or GPTProvider(
        assistant="tests_generator",
    )
    response = gpt.send_message(
        prompt=tests_request.code,
    )
    response = (
        response
        if "tests" in response
        else {"tests": ["# Failed to generate the test cases"]}
    )

    with open(f"data.json", "r") as f:
        data = json.load(f)

    if tests_request.snippet_id not in data:
        data[tests_request.snippet_id] = {}
    data[tests_request.snippet_id]["tests"] = data[tests_request.snippet_id].get(
        "tests", []
    ) + [
        {"role": "user", "message": tests_request.code},
        {"role": "assistant", "message": json.dumps(response)},
    ]

    with open(f"data.json", "w") as f:
        json.dump(data, f)

    return response
