# Script para crear encuesta completa de prueba
$baseUrl = "http://localhost:3000"
$loginUrl = "$baseUrl/api/auth/login"
$encuestaUrl = "$baseUrl/api/encuesta"

Write-Host "CREANDO ENCUESTA COMPLETA DE PRUEBA" -ForegroundColor Cyan

# 1. LOGIN
Write-Host "`nPaso 1: Autenticacion..." -ForegroundColor Yellow
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. LEER JSON
Write-Host "`nPaso 2: Cargando datos..." -ForegroundColor Yellow
try {
    $encuestaData = Get-Content -Path "ejemplo-encuesta-completa.json" -Raw
    $encuesta = $encuestaData | ConvertFrom-Json
    Write-Host "Archivo JSON cargado" -ForegroundColor Green
    Write-Host "   Familia: $($encuesta.informacionGeneral.apellido_familiar)" -ForegroundColor White
    Write-Host "   Miembros vivos: $($encuesta.familyMembers.Count)" -ForegroundColor White
} catch {
    Write-Host "Error leyendo JSON: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. ENVIAR ENCUESTA
Write-Host "`nPaso 3: Enviando encuesta..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $encuestaData -Headers $headers
    
    Write-Host "ENCUESTA CREADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "`nRESULTADO:" -ForegroundColor Cyan
    Write-Host "   ID Familia: $($response.data.familia_id)" -ForegroundColor White
    Write-Host "   Codigo: $($response.data.codigo_familia)" -ForegroundColor White
    Write-Host "   Personas creadas: $($response.data.personas_creadas)" -ForegroundColor White
    Write-Host "   Personas fallecidas: $($response.data.personas_fallecidas)" -ForegroundColor White
    
    # Guardar ID
    $response.data.familia_id | Out-File -FilePath "ultimo-familia-id.txt" -NoNewline
    Write-Host "`nID guardado en ultimo-familia-id.txt" -ForegroundColor Gray
    
} catch {
    Write-Host "ERROR AL CREAR ENCUESTA" -ForegroundColor Red
    Write-Host "   Mensaje: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nDETALLES:" -ForegroundColor Yellow
        try {
            $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Code: $($errorJson.code)" -ForegroundColor White
            Write-Host "   Message: $($errorJson.message)" -ForegroundColor White
            if ($errorJson.details) {
                Write-Host "   Details: $($errorJson.details)" -ForegroundColor White
            }
            if ($errorJson.errors) {
                Write-Host "`n   Errores:" -ForegroundColor Yellow
                foreach ($err in $errorJson.errors) {
                    Write-Host "     - $err" -ForegroundColor White
                }
            }
        } catch {
            Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor White
        }
    }
    
    exit 1
}
