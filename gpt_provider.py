from openai import OpenAI


class GPTProvider:
    def __init__(self):
        self.client = OpenAI()

    def send_message(
        self,
        prompt,
        max_tokens=None,
        temperature=0.2,
    ):
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"An error occurred: {e}")
            return {"error": "Failed to generate the response"}
