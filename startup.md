docker run --runtime nvidia --gpus all \
    -v ~/.cache/huggingface:/run/media/andrew/huggingface \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model AMead10/SuperNova-Medius-AWQ
    --max_model_len 16384
    --api-key bad_api_key