# `Code Snippet Generation Assistant`

This project is a code snippet generation assistant that helps quickly generate code snippets for JavaScript, Python, Ruby, C++ and Java

### Prerequisites

It is recommended to use Docker to try this project:

Follow the installation guide for your system on the [Docker website](https://docs.docker.com/get-docker/).

### Installation

To use the Code Snippet Generation Assistant, follow these steps:

1. **Clone the repository**

   Start by cloning this repository to your local machine.

   ```sh
   git clone git@github.com:Ivanes1/code-snippet-generator.git
   cd code-snippet-generator
   ```

2. **Add env variables to .env**

   Create a `.env` file in the directory and add your `OPEN_API_KEY` and `OPENAI_ORG_ID` there

3. **Run the shell script**

   Run the provided `start-docker-server.sh` shell script to create the docker image and start the container

   This might take a few minutes as it needs to install all required packages.

4. **Open the html file**

   Once the container is running, open the `index.html` file and try out the assistant!

## Contributing

Feel free to contribute to the project!
