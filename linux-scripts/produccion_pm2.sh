#!/bin/bash

# PRODUCCION PM2
# Generado automáticamente por notebook de gestión de scripts

set -e  # Salir si hay error

npm run pm2:start
npm run pm2:status

echo "✅ Secuencia completada: produccion_pm2"