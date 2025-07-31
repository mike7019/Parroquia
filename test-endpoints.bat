@echo off
echo ======================================
echo PRUEBAS DE ENDPOINTS DE CREACION
echo ======================================

set BASE_URL=http://localhost:3000/api

echo.
echo 1. Obteniendo token de autenticacion...
curl -s -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@parroquia.com\",\"password\":\"Test123456!\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"admin\",\"phone\":\"+57 300 123 4567\"}" > nul 2>&1

for /f "tokens=*" %%i in ('curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"test@parroquia.com\",\"password\":\"Test123456!\"}" ^| jq -r ".data.accessToken"') do set TOKEN=%%i

echo Token obtenido: %TOKEN:~0,20%...

echo.
echo 2. Probando endpoint: Registro de Usuario
curl -s -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"nuevo%RANDOM%@test.com\",\"password\":\"Test123456!\",\"firstName\":\"Nuevo\",\"lastName\":\"Usuario\",\"role\":\"surveyor\",\"phone\":\"+57 300 999 8888\"}" | jq .

echo.
echo 3. Probando endpoint: Crear Sector
curl -s -X POST "%BASE_URL%/catalog/sectors" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"nombre\":\"Sector Test %RANDOM%\"}" | jq .

echo.
echo 4. Probando endpoint: Crear Sexo
curl -s -X POST "%BASE_URL%/catalog/sexos" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"sexo\":\"Test %RANDOM%\"}" | jq .

echo.
echo 5. Probando endpoint: Crear Parroquia
curl -s -X POST "%BASE_URL%/catalog/parroquias" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"nombre\":\"Parroquia Test %RANDOM%\"}" | jq .

echo.
echo 6. Probando endpoint: Crear Departamento
curl -s -X POST "%BASE_URL%/catalog/departamentos" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"nombre\":\"Departamento Test %RANDOM%\",\"codigo_dane\":\"99\",\"region\":\"Test Region\"}" | jq .

echo.
echo ======================================
echo PRUEBAS COMPLETADAS
echo ======================================
