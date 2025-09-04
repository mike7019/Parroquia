#!/bin/bash

# GESTOR DE SCRIPTS PARA LINUX
# ============================
# Generado automáticamente por notebook de gestión

echo "🐧 GESTOR DE SCRIPTS PARROQUIA - LINUX"
echo "======================================"
echo ""
echo "Seleccione una opción:"
echo "1) Setup inicial"
echo "2) Desarrollo" 
echo "3) Producción con PM2"
echo "4) Producción con Docker"
echo "5) Mantenimiento DB"
echo "6) Actualización código"
echo "7) Logs y monitoreo"
echo "8) Backup y restauración"
echo ""
read -p "Opción (1-8): " opcion

case $opcion in
  1) bash ./setup_inicial.sh ;;
  2) bash ./desarrollo.sh ;;
  3) bash ./produccion_pm2.sh ;;
  4) bash ./produccion_docker.sh ;;
  5) bash ./mantenimiento_db.sh ;;
  6) bash ./actualizacion_codigo.sh ;;
  7) bash ./logs_monitoreo.sh ;;
  8) bash ./backup_restauracion.sh ;;
  *) echo "❌ Opción no válida" ;;
esac
