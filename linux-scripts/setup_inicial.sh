#!/bin/bash

# SETUP INICIAL
# Generado automáticamente por notebook de gestión de scripts

set -e  # Salir si hay error

npm install
npm run db:check
npm run db:sync
npm run db:seed:config
npm run admin:create

echo "✅ Secuencia completada: setup_inicial"