#!/bin/bash

# Deployment script for Parroquia Application
# This script helps configure the server for Jenkins deployment

set -e  # Exit on any error

echo "🚀 Configurando servidor para despliegue con Jenkins..."

# Variables
PROJECT_PATH="/home/l4bs/parroquia/backend/Parroquia"
REPO_URL="https://github.com/mike7019/Parroquia.git"
BRANCH="feature"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Verificando prerequisitos..."

if ! command_exists docker; then
    print_error "Docker no está instalado. Por favor instálalo primero."
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose no está instalado. Por favor instálalo primero."
    exit 1
fi

if ! command_exists git; then
    print_error "Git no está instalado. Por favor instálalo primero."
    exit 1
fi

# Create project directory
print_status "Creando directorio del proyecto..."
sudo mkdir -p $(dirname "$PROJECT_PATH")
sudo chown -R $USER:$USER $(dirname "$PROJECT_PATH")

# Clone or update repository
if [ -d "$PROJECT_PATH" ]; then
    print_status "Actualizando repositorio existente..."
    cd "$PROJECT_PATH"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    print_status "Clonando repositorio..."
    git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_PATH"
    cd "$PROJECT_PATH"
fi

# Setup environment file
print_status "Configurando archivo de entorno..."
if [ ! -f .env.production ]; then
    print_warning "Archivo .env.production no encontrado. Creando desde ejemplo..."
    cp .env.production.example .env.production
    print_warning "¡IMPORTANTE! Edita .env.production con tus valores reales antes del despliegue."
fi

# Copy to .env for deployment
cp .env.production .env

# Create necessary directories
print_status "Creando directorios necesarios..."
mkdir -p logs uploads temp

# Set proper permissions
print_status "Configurando permisos..."
chmod -R 755 .
chmod +x scripts/*.sh 2>/dev/null || true

# Test Docker setup
print_status "Probando configuración de Docker..."
docker-compose config > /dev/null

if [ $? -eq 0 ]; then
    print_status "✅ Configuración de Docker válida"
else
    print_error "❌ Error en configuración de Docker"
    exit 1
fi

# Optional: Do a test build
read -p "¿Quieres hacer una construcción de prueba? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Construyendo imágenes de Docker..."
    docker-compose build
    
    print_status "Iniciando servicios de prueba..."
    docker-compose up -d
    
    sleep 30
    
    print_status "Verificando estado de los servicios..."
    docker-compose ps
    
    # Test health endpoint
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        print_status "✅ Aplicación funcionando correctamente"
    else
        print_warning "⚠️  La aplicación no responde en el endpoint de salud"
    fi
    
    print_status "Deteniendo servicios de prueba..."
    docker-compose down
fi

print_status "🎉 Configuración del servidor completada!"
echo ""
echo "Próximos pasos:"
echo "1. Edita $PROJECT_PATH/.env.production con tus valores reales"
echo "2. Configura las credenciales SSH en Jenkins"
echo "3. Ejecuta el pipeline de Jenkins"
echo ""
echo "Para verificar el estado después del despliegue:"
echo "  docker-compose ps"
echo "  curl http://localhost:3000/api/health"
echo ""
print_status "El servidor está listo para el despliegue con Jenkins! 🚀"
