#!/bin/bash

# BACKUP RESTAURACION
# Generado automáticamente por notebook de gestión de scripts

set -e  # Salir si hay error

npm run pm2:stop
npm run pm2:start

echo "✅ Secuencia completada: backup_restauracion"