from openai import OpenAI


class GPTProvider:
    def __init__(self, context=[]):
        self.client = OpenAI()
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
                    {"role": "system", "content": "You are a helpful assistant."},
                    *self.context,
                    user_message,  # type: ignore
                ],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            self.context.extend([user_message, response.choices[0].message])
            return response.choices[0].message.content
        except Exception as e:
            print(f"An error occurred: {e}")
            return {"error": "Failed to generate the response"}
