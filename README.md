# Compute Community
Compute Community is a peer-to-peer AI compute network that enables users to run large language models (LLMs) on trusted, community-powered GPUs. 

[compute-community page](https://computecommunity.com)

Add gateway url, API key and model name provided by your friends (or any openai API compliant server) in the settings page to start computing.

## Frontend Development
The frontend is built with Next.js. For local development:

1. Navigate to the frontend directory
```bash
cd frontend
```

2. Install dependencies and run the development server
```bash
npm install
npm run dev
```

## Server Setup
After the setup, you will have a API key and gateway url and model name for your network of friends to use. 

### Prerequisites
- Docker Desktop
- WSL (Windows Subsystem for Linux) if running on Windows
- NVIDIA GPU with compatible drivers
- NVIDIA Container Toolkit
- ngrok (for exposing local server)

### 1. Docker Configuration
Ensure Docker is installed and properly configured with NVIDIA support. The server uses vLLM for LLM inference.

### 2. Running the Server
Make sure the model fits on your GPU.

Example Docker command to start the server:

On windows cmd,
``` bat
docker run --runtime nvidia --gpus all ^
    -p 8000:8000 ^
    --ipc=host ^
    vllm/vllm-openai:latest ^
    --model Qwen/Qwen2.5-14B-Instruct-AWQ ^
    --gpu-memory-utilization 0.90 ^
    --max_model_len 16384 ^
    --api-key YOUR_API_KEY
```

On linux,
``` bash
docker run --runtime nvidia --gpus all \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model Qwen/Qwen2.5-14B-Instruct-AWQ
    --max_model_len 16384 \
    --api-key YOUR_API_KEY
```

### 3. ngrok Setup
To expose your local server to the internet:

1. Set up ngrok account and authenticate
2. Create a static domain (example: sunbird-infinite-partially.ngrok-free.app)
3. Start ngrok tunnel:
```bash
ngrok http --url=YOUR_STATIC_DOMAIN 8000
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

