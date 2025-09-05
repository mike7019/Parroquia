@echo off
setlocal enabledelayedexpansion

echo 🔍 VERIFICADOR DE VARIABLES DE ENTORNO - WINDOWS
echo ===============================================
echo.

echo Verificando variables críticas para el proyecto Parroquia...
echo.

set all_ok=true

:: Función para verificar variable
:: %1 = nombre de variable, %2 = descripción, %3 = valor alternativo
call :check_var "DB_PASSWORD,POSTGRES_PASSWORD" "Contraseña de la base de datos" ""
call :check_var "JWT_SECRET" "Secreto para tokens JWT" ""
call :check_var "JWT_REFRESH_SECRET" "Secreto para refresh tokens JWT" ""

echo.
echo --- Variables opcionales ---
call :check_var "DB_NAME,POSTGRES_DB" "Nombre de la base de datos" "parroquia_db"
call :check_var "DB_USER,POSTGRES_USER" "Usuario de la base de datos" "parroquia_user"
call :check_var "DB_HOST" "Host de la base de datos" "postgres"
call :check_var "DB_PORT" "Puerto de la base de datos" "5432"
call :check_var "PORT" "Puerto de la aplicación" "3000"
call :check_var "NODE_ENV" "Entorno de Node.js" "production"

echo.
echo --- Variables de email (opcional) ---
call :check_var "SMTP_HOST" "Servidor SMTP" "no configurado"
call :check_var "SMTP_PORT" "Puerto SMTP" "587"
call :check_var "SMTP_USER" "Usuario SMTP" "no configurado"
call :check_var "SMTP_PASS" "Contraseña SMTP" "no configurado"

echo.
if "!all_ok!"=="true" (
    echo ✅ TODAS LAS VARIABLES CRÍTICAS ESTÁN CONFIGURADAS
    echo El proyecto debería funcionar correctamente.
) else (
    echo ❌ VARIABLES CRÍTICAS FALTANTES
    echo.
    echo Para configurar variables en Windows:
    echo 1. Busque "Variables de entorno" en el menú inicio
    echo 2. Haga clic en "Variables de entorno..."
    echo 3. En "Variables del sistema" haga clic en "Nueva..."
    echo 4. Configure las variables según el archivo bashrc-variables-ejemplo.sh
    echo 5. Reinicie el terminal/PowerShell
    echo.
    echo Alternativamente, puede crear un archivo .env en el directorio del proyecto
)

echo.
pause

goto :eof

:check_var
set var_names=%~1
set description=%~2
set default_value=%~3
set found_value=

:: Separar nombres de variables por comas
for %%i in (%var_names%) do (
    call set temp_value=%%%i%%
    if not "!temp_value!"=="" (
        set found_value=!temp_value!
        goto :found
    )
)

:found
if not "!found_value!"=="" (
    echo ✅ %description%: configurada
    if not "%4"=="hide_value" (
        if "!found_value:~0,10!"=="!found_value!" (
            echo    Valor: !found_value!
        ) else (
            echo    Valor: !found_value:~0,10!... ^(truncado^)
        )
    )
) else (
    if "%default_value%"=="" (
        echo ❌ %description%: NO CONFIGURADA ^(REQUERIDA^)
        set all_ok=false
    ) else (
        echo ⚠️  %description%: usando valor por defecto ^(%default_value%^)
    )
)

goto :eof
