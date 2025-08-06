@echo off
echo 🔧 Ejecutando pruebas finales del UserService...
echo.

cd /d "%~dp0.."
node scripts/test-user-service-final.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡Todas las pruebas pasaron exitosamente!
    echo.
    echo 🚀 Ahora puedes probar la API:
    echo    GET http://localhost:3000/api/users
    echo.
    echo 📋 Los endpoints disponibles son:
    echo    GET /api/users           - Obtener usuarios activos
    echo    GET /api/users/deleted   - Obtener usuarios eliminados
    echo    GET /api/users/{id}      - Obtener usuario por ID
    echo    PUT /api/users/{id}      - Actualizar usuario
    echo    DELETE /api/users/{id}   - Eliminar usuario ^(soft delete^)
) else (
    echo.
    echo ❌ Algunas pruebas fallaron. Codigo de salida: %ERRORLEVEL%
    echo.
    echo 🔧 Posibles soluciones:
    echo    1. Verificar que la base de datos este funcionando
    echo    2. Revisar los logs del script anterior
    echo    3. Ejecutar: node scripts/test-user-service-final.js
)

echo.
echo 📝 Para ejecutar manualmente: node scripts/test-user-service-final.js
pause
