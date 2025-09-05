@echo off
setlocal enabledelayedexpansion

echo 🚀 INICIANDO PROYECTO PARROQUIA
echo ===============================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "docker-compose.yml" (
    echo ❌ Error: No se encuentra docker-compose.yml
    echo Ejecute este script desde el directorio raíz del proyecto
    pause
    exit /b 1
)

:: Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado o no está en el PATH
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo ✅ Docker y Docker Compose detectados

:: Verificar variables de entorno críticas
echo.
echo 🔍 Verificando variables de entorno...

set missing_vars=false

if "%DB_PASSWORD%"=="" if "%POSTGRES_PASSWORD%"=="" (
    echo ❌ DB_PASSWORD o POSTGRES_PASSWORD no configurada
    set missing_vars=true
)

if "%JWT_SECRET%"=="" (
    echo ❌ JWT_SECRET no configurada
    set missing_vars=true
)

if "!missing_vars!"=="true" (
    echo.
    echo ❌ Variables críticas faltantes
    echo Configure las variables de entorno en Windows:
    echo 1. Busque "Variables de entorno" en el menú inicio
    echo 2. Configure las variables según bashrc-variables-ejemplo.sh
    echo 3. Reinicie el terminal
    pause
    exit /b 1
)

echo ✅ Variables críticas configuradas

:: Mostrar configuración
echo.
echo 📊 Configuración que se usará:
echo ------------------------------
if not "%DB_NAME%"=="" (
    echo Base de datos: %DB_NAME%
) else if not "%POSTGRES_DB%"=="" (
    echo Base de datos: %POSTGRES_DB%
) else (
    echo Base de datos: parroquia_db ^(default^)
)

if not "%DB_USER%"=="" (
    echo Usuario DB: %DB_USER%
) else if not "%POSTGRES_USER%"=="" (
    echo Usuario DB: %POSTGRES_USER%
) else (
    echo Usuario DB: parroquia_user ^(default^)
)

if not "%PORT%"=="" (
    echo Puerto: %PORT%
) else (
    echo Puerto: 3000 ^(default^)
)

if not "%NODE_ENV%"=="" (
    echo Entorno: %NODE_ENV%
) else (
    echo Entorno: production ^(default^)
)

:: Detener servicios existentes
echo.
echo 🛑 Deteniendo servicios existentes...
docker-compose down

:: Construir e iniciar servicios
echo.
echo 🔨 Construyendo e iniciando servicios...
docker-compose up -d --build

if errorlevel 1 (
    echo ❌ Error al iniciar los servicios
    echo.
    echo Verifique:
    echo 1. Variables de entorno configuradas
    echo 2. Docker funcionando correctamente
    echo 3. Puertos no ocupados
    pause
    exit /b 1
)

:: Esperar a que los servicios estén listos
echo.
echo ⏳ Esperando que los servicios estén listos...
timeout /t 10 /nobreak >nul

:: Verificar estado de los servicios
echo.
echo 📊 Estado de los servicios:
docker-compose ps

:: Verificar conectividad
echo.
echo 🔗 Verificando conectividad...

set max_attempts=30
set attempt=1

:check_api
if !attempt! gtr !max_attempts! goto api_failed

:: Determinar puerto
set api_port=3000
if not "%PORT%"=="" set api_port=%PORT%

:: Verificar API con curl o powershell
curl -s http://localhost:!api_port!/api/health >nul 2>&1
if errorlevel 1 (
    echo ⏳ Intento !attempt!/!max_attempts! - Esperando que la API esté lista...
    timeout /t 2 /nobreak >nul
    set /a attempt+=1
    goto check_api
)

echo ✅ API está respondiendo
goto success

:api_failed
echo ❌ La API no respondió después de %max_attempts% intentos
echo.
echo 🔍 Logs de la API:
docker-compose logs api
pause
exit /b 1

:success
:: Mostrar información final
echo.
echo 🎉 PROYECTO INICIADO EXITOSAMENTE
echo =================================
echo.
echo 🔗 URLs disponibles:

if not "%PORT%"=="" (
    set api_port=%PORT%
) else (
    set api_port=3000
)

echo • API Health: http://localhost:!api_port!/api/health
echo • Swagger Docs: http://localhost:!api_port!/api/docs
echo • API Base: http://localhost:!api_port!/api
echo.
echo 📋 Comandos útiles:
echo • Ver logs: docker-compose logs -f
echo • Ver logs API: docker-compose logs -f api
echo • Ver logs DB: docker-compose logs -f postgres
echo • Detener: docker-compose down
echo • Reiniciar: docker-compose restart
echo.
echo 🔧 Para troubleshooting:
echo • Verificar variables: verificar-variables.bat
echo • Conectar a DB: docker-compose exec postgres psql -U [usuario] -d [base_datos]
echo.
echo Presione cualquier tecla para continuar...
pause >nul
