#!/bin/bash

# Script de configuración de producción para el servidor
# Este script debe ejecutarse en el servidor de producción

set -e  # Salir si cualquier comando falla

echo "🔧 Configurando entorno de producción..."

# Variables del proyecto
PROJECT_DIR="/home/ubuntu/Parroquia"
ENV_FILE="$PROJECT_DIR/.env"
ENV_PRODUCTION_FILE="$PROJECT_DIR/.env.production"

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Directorio del proyecto no encontrado: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Verificar que existe el archivo .env.production
if [ ! -f "$ENV_PRODUCTION_FILE" ]; then
    echo "❌ Error: Archivo .env.production no encontrado"
    echo "Por favor, crea el archivo .env.production con las variables necesarias"
    exit 1
fi

# Copiar configuración de producción
echo "📋 Copiando configuración de producción..."
cp "$ENV_PRODUCTION_FILE" "$ENV_FILE"

# Verificar que Docker está corriendo
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Verificar que Docker Compose está disponible
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ Error: Docker Compose no está disponible"
    exit 1
fi

echo "✅ Configuración completada"
echo "🚀 El sistema está listo para el despliegue"
