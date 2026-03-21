#!/bin/bash
# scripts/setup.sh — Run this on a fresh Contabo VPS

set -e

echo "=== Athena AI Server Setup ==="

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker

# Install Docker Compose
apt install -y docker-compose-plugin

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Create app directory
mkdir -p /opt/athena-ai
cd /opt/athena-ai

# Copy environment file
cp .env.example .env
echo ">>> Edit .env with your values: nano .env"

# Generate secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
echo "DB_PASSWORD=$(openssl rand -base64 24)" >> .env

# Start services
docker compose up -d

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
sleep 10

# Pull AI models
docker compose exec ollama ollama pull llama3.1:8b
docker compose exec ollama ollama pull mistral:7b
docker compose exec ollama ollama pull nomic-embed-text

# Run database migrations
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed

# Setup SSL
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m your@email.com

# Setup automated backups (daily at 2 AM)
echo "0 2 * * * /opt/athena-ai/scripts/backup.sh" | crontab -

echo "=== Athena AI is live at https://$DOMAIN ==="
