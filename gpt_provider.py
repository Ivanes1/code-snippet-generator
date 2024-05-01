from openai import OpenAI
import json

from constants import SYSTEM_PROMPTS


class GPTProvider:
    def __init__(self, assistant, context=[]):
        self.client = OpenAI()
        self.assistant = assistant
        self.context = context

    def send_message(
        self,
        prompt,
        max_tokens=None,
        temperature=0.2,
    ):
        try:
            user_message = {"role": "user", "content": prompt}
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPTS.get(
                            self.assistant, "You are a helper assistant."
                        ),
                    },
                    *self.context,
                    user_message,  # type: ignore
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                response_format={"type": "json_object"},
            )
            self.context.extend([user_message, response.choices[0].message])
            return json.loads(
                response.choices[0].message.content
                or "{'error': 'Failed to generate the response'}"
            )
        except Exception as e:
            print(f"An error occurred: {e}")
            return {"error": "Failed to generate the response"}
