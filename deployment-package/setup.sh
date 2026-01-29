#!/bin/bash
set -e

echo "================================"
echo "MandiApp Setup"
echo "================================"
echo ""

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# Configure environment
echo "Setting up environment..."
if grep -q "CHANGE_THIS" .env; then
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    sed -i "s|JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_64_CHARS|JWT_SECRET=$JWT_SECRET|g" .env
    
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
    sed -i "s|POSTGRES_PASSWORD=CHANGE_THIS_SECURE_PASSWORD|POSTGRES_PASSWORD=$DB_PASSWORD|g" .env
fi

# Start services
echo ""
echo "Starting services..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up --build -d

echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo ""
echo "Application URL: http://140.245.9.144"
echo ""
echo "Check status: docker compose ps"
echo "View logs: docker compose logs -f"