@echo off
echo 🔧 Ejecutando verificacion del servicio de usuarios...
echo.

cd /d "%~dp0.."
node scripts/test-user-service.js

echo.
echo ✅ Verificacion completada.
pause
