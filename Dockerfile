# Use a base image that has Python and allows for easier installation of other dependencies
FROM ubuntu:22.04

# Install packages needed to run the tests
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    ruby-full \
    nodejs \
    openjdk-17-jdk \
    g++ \
    && rm -rf /var/lib/apt/lists/*

ADD requirements.txt /app/requirements.txt
RUN pip3 install -r /app/requirements.txt --no-cache-dir
ADD . /app
WORKDIR /app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
