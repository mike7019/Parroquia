#!/bin/bash

# ACTUALIZACION CODIGO
# Generado automáticamente por notebook de gestión de scripts

set -e  # Salir si hay error

git pull origin main
npm install
npm run db:sync:alter
npm run pm2:restart

echo "✅ Secuencia completada: actualizacion_codigo"