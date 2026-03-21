#!/bin/bash
# scripts/pull-models.sh — Download Ollama models

set -e

OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"

echo "Pulling AI models from Ollama..."

echo "1/3: Pulling llama3.1:8b (general purpose)..."
docker compose exec ollama ollama pull llama3.1:8b

echo "2/3: Pulling mistral:7b (structured output)..."
docker compose exec ollama ollama pull mistral:7b

echo "3/3: Pulling nomic-embed-text (embeddings)..."
docker compose exec ollama ollama pull nomic-embed-text

echo "All models downloaded successfully!"
