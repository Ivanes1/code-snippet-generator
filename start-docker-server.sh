if [ ! -f .env ]; then
    echo "Please create a .env file, see .env.example for reference"
    exit 1
fi
docker build -t $IMAGE_NAME .
docker run --rm -p 8000:8000 --env-file .env $IMAGE_NAME
