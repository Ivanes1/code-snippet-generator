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


class CodeRequest(BaseModel):
    prompt: str


class TestsRequest(BaseModel):
    code: str


@app.post("/generate_code")
async def generate_code(code_request: CodeRequest):
    gpt = GPTProvider(
        assistant="code_generator",
    )
    response = gpt.send_message(
        prompt=code_request.prompt,
    )

    return (
        response
        if "code" in response
        else {"code": "# Failed to generate the code", "language": "python"}
    )


@app.post("/generate_tests")
async def generate_tests(tests_request: TestsRequest):
    gpt = GPTProvider(
        assistant="tests_generator",
    )
    response = gpt.send_message(
        prompt=tests_request.code,
    )

    return (
        response
        if "tests" in response
        else {"tests": ["# Failed to generate the test cases"]}
    )
