#!/bin/bash

# LOGS MONITOREO
# Generado automáticamente por notebook de gestión de scripts

set -e  # Salir si hay error

npm run pm2:logs
npm run pm2:status

echo "✅ Secuencia completada: logs_monitoreo"