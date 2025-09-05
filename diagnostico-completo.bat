@echo off
setlocal enabledelayedexpansion

echo 🔧 DIAGNÓSTICO COMPLETO DEL PROYECTO PARROQUIA
echo =============================================
echo.

set error_count=0

:: Función para mostrar resultado con emoji
:: %1 = condición (true/false), %2 = mensaje de éxito, %3 = mensaje de error
goto main

:check_result
if "%~1"=="true" (
    echo ✅ %~2
) else (
    echo ❌ %~3
    set /a error_count+=1
)
goto :eof

:main

echo === 1. VERIFICACIÓN DEL ENTORNO ===

:: Verificar directorio
if exist "docker-compose.yml" (
    call :check_result "true" "Directorio correcto (docker-compose.yml encontrado)" ""
) else (
    call :check_result "false" "" "Directorio incorrecto (docker-compose.yml no encontrado)"
)

:: Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :check_result "false" "" "Docker no está instalado o no está en el PATH"
) else (
    for /f "tokens=3" %%a in ('docker --version') do (
        call :check_result "true" "Docker instalado (versión %%a)" ""
    )
)

:: Verificar Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :check_result "false" "" "Docker Compose no está instalado"
) else (
    for /f "tokens=3" %%a in ('docker-compose --version') do (
        call :check_result "true" "Docker Compose instalado (versión %%a)" ""
    )
)

echo.
echo === 2. VERIFICACIÓN DE VARIABLES DE ENTORNO ===

:: Variables críticas
if not "%DB_PASSWORD%"=="" (
    call :check_result "true" "DB_PASSWORD configurada" ""
) else if not "%POSTGRES_PASSWORD%"=="" (
    call :check_result "true" "POSTGRES_PASSWORD configurada" ""
) else (
    call :check_result "false" "" "DB_PASSWORD/POSTGRES_PASSWORD no configurada"
)

if not "%JWT_SECRET%"=="" (
    call :check_result "true" "JWT_SECRET configurada" ""
) else (
    call :check_result "false" "" "JWT_SECRET no configurada"
)

:: Variables opcionales con defaults
if not "%DB_NAME%"=="" (
    call :check_result "true" "DB_NAME configurada: %DB_NAME%" ""
) else if not "%POSTGRES_DB%"=="" (
    call :check_result "true" "POSTGRES_DB configurada: %POSTGRES_DB%" ""
) else (
    call :check_result "true" "Usando DB por defecto: parroquia_db" ""
)

echo.
echo === 3. VERIFICACIÓN DE PUERTOS ===

:: Verificar si el puerto está ocupado
set port=3000
if not "%PORT%"=="" set port=%PORT%

netstat -an | findstr ":%port% " >nul 2>&1
if errorlevel 1 (
    call :check_result "true" "Puerto %port% disponible" ""
) else (
    call :check_result "false" "" "Puerto %port% está ocupado"
)

:: Puerto de PostgreSQL
netstat -an | findstr ":5432 " >nul 2>&1
if errorlevel 1 (
    call :check_result "true" "Puerto 5432 (PostgreSQL) disponible" ""
) else (
    call :check_result "false" "" "Puerto 5432 (PostgreSQL) está ocupado"
)

echo.
echo === 4. VERIFICACIÓN DE SERVICIOS DOCKER ===

:: Verificar si los servicios están corriendo
docker-compose ps >nul 2>&1
if errorlevel 1 (
    echo ℹ️  Servicios no están corriendo (normal si es la primera vez)
) else (
    echo 📊 Estado de servicios Docker:
    docker-compose ps
)

echo.
echo === 5. VERIFICACIÓN DE ARCHIVOS CRÍTICOS ===

:: Verificar archivos importantes
set files=src\app.js src\config\database.js docker-compose.yml Dockerfile
for %%f in (%files%) do (
    if exist "%%f" (
        call :check_result "true" "%%f existe" ""
    ) else (
        call :check_result "false" "" "%%f no encontrado"
    )
)

echo.
echo === 6. VERIFICACIÓN DE CONECTIVIDAD ===

:: Verificar conectividad a internet (para dependencias)
ping -n 1 google.com >nul 2>&1
if errorlevel 1 (
    call :check_result "false" "" "Sin conexión a Internet"
) else (
    call :check_result "true" "Conexión a Internet disponible" ""
)

:: Verificar Docker Hub (para imágenes)
ping -n 1 registry-1.docker.io >nul 2>&1
if errorlevel 1 (
    call :check_result "false" "" "No se puede conectar a Docker Hub"
) else (
    call :check_result "true" "Docker Hub accesible" ""
)

echo.
echo === 7. VERIFICACIÓN DE RECURSOS ===

:: Verificar espacio en disco (aproximado)
for /f "tokens=3" %%a in ('dir /-c ^| findstr "bytes free"') do (
    if %%a GTR 1000000000 (
        call :check_result "true" "Espacio en disco suficiente" ""
    ) else (
        call :check_result "false" "" "Poco espacio en disco disponible"
    )
)

echo.
echo === RESUMEN ===
echo ===============

if !error_count! equ 0 (
    echo 🎉 ¡TODO ESTÁ BIEN! El proyecto debería funcionar correctamente.
    echo.
    echo Puede proceder a ejecutar:
    echo   iniciar-proyecto.bat
) else (
    echo ⚠️  Se encontraron !error_count! problemas que necesitan atención.
    echo.
    echo 🔧 SOLUCIONES RECOMENDADAS:
    echo.
    
    if "%DB_PASSWORD%"=="" if "%POSTGRES_PASSWORD%"=="" (
        echo • Configure las variables de entorno críticas
        echo   Ver: CONFIGURACION_VARIABLES_WINDOWS.md
    )
    
    echo • Asegúrese de que Docker esté corriendo
    echo • Verifique que los puertos no estén ocupados
    echo • Consulte la documentación en README.md
)

echo.
echo === INFORMACIÓN ADICIONAL ===

echo 📋 Versiones detectadas:
docker --version 2>nul || echo Docker: No instalado
docker-compose --version 2>nul || echo Docker Compose: No instalado
node --version 2>nul || echo Node.js: No instalado
npm --version 2>nul || echo NPM: No instalado

echo.
echo 📁 Directorio actual: %CD%
echo 🕒 Fecha y hora: %date% %time%

echo.
echo Presione cualquier tecla para continuar...
pause >nul
