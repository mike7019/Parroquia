#!/bin/bash

# MANTENIMIENTO DB
# Generado automáticamente por notebook de gestión de scripts

set -e  # Salir si hay error

npm run db:check
npm run db:sync:alter
npm run db:seed:complete

echo "✅ Secuencia completada: mantenimiento_db"