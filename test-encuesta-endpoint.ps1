# Script de PowerShell para probar el endpoint de encuestas
# Usar: .\test-encuesta-endpoint.ps1

Write-Host "🧪 Probando endpoint de encuestas con JSON MIA..." -ForegroundColor Green

# Configurar variables
$serverUrl = "http://localhost:3000"
$endpoint = "/api/encuesta"
$jsonFilePath = "c:\Users\lil-a\Downloads\Json encuesta MIA.json"

# Leer el archivo JSON
try {
    $jsonContent = Get-Content -Path $jsonFilePath -Raw -ErrorAction Stop
    Write-Host "✅ JSON cargado desde archivo" -ForegroundColor Green
} catch {
    Write-Host "❌ Error leyendo archivo JSON: $_" -ForegroundColor Red
    exit 1
}

# Verificar que el servidor esté ejecutándose
try {
    $response = Invoke-WebRequest -Uri $serverUrl -Method HEAD -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Servidor respondiendo en $serverUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor no responde en $serverUrl" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar: npm start" -ForegroundColor Yellow
    exit 1
}

# Nota sobre el token JWT
Write-Host "⚠️ IMPORTANTE: Necesitas un token JWT válido" -ForegroundColor Yellow
Write-Host "   1. Inicia sesión en el sistema para obtener un token" -ForegroundColor Cyan
Write-Host "   2. Reemplaza 'YOUR_JWT_TOKEN' en este script con el token real" -ForegroundColor Cyan
Write-Host ""

# Token JWT (reemplazar con token real)
$jwtToken = "YOUR_JWT_TOKEN"

if ($jwtToken -eq "YOUR_JWT_TOKEN") {
    Write-Host "🔑 Para obtener un token JWT:" -ForegroundColor Magenta
    Write-Host "   POST $serverUrl/api/auth/login" -ForegroundColor White
    Write-Host "   Body: { ""correo_electronico"": ""tu@email.com"", ""contrasena"": ""tu_contraseña"" }" -ForegroundColor White
    Write-Host ""
    
    # Comando curl alternativo
    Write-Host "🔧 Comando curl alternativo:" -ForegroundColor Cyan
    Write-Host "curl -X POST $serverUrl$endpoint ``" -ForegroundColor White
    Write-Host "  -H `"Content-Type: application/json`" ``" -ForegroundColor White
    Write-Host "  -H `"Authorization: Bearer TU_TOKEN_JWT`" ``" -ForegroundColor White
    Write-Host "  -d @`"$jsonFilePath`"" -ForegroundColor White
    
    exit 0
}

# Configurar headers
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $jwtToken"
}

Write-Host "🚀 Enviando request al endpoint..." -ForegroundColor Blue

try {
    # Enviar request
    $response = Invoke-RestMethod -Uri "$serverUrl$endpoint" -Method POST -Body $jsonContent -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Request exitoso!" -ForegroundColor Green
    Write-Host "📤 Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "📝 Message: $($response.message)" -ForegroundColor Cyan
    
    if ($response.data) {
        Write-Host "📊 Datos de respuesta:" -ForegroundColor Yellow
        Write-Host "   - Familia ID: $($response.data.familia_id)" -ForegroundColor White
        Write-Host "   - Personas creadas: $($response.data.personas_creadas)" -ForegroundColor White
        Write-Host "   - Personas fallecidas: $($response.data.personas_fallecidas)" -ForegroundColor White
        Write-Host "   - Código familia: $($response.data.codigo_familia)" -ForegroundColor White
        Write-Host "   - Transacción ID: $($response.data.transaccion_id)" -ForegroundColor White
    }
    
    # Mostrar respuesta completa
    Write-Host "`n📋 Respuesta completa:" -ForegroundColor Magenta
    $response | ConvertTo-Json -Depth 10 | Write-Host

} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDescription = $_.Exception.Response.StatusDescription
    
    Write-Host "❌ Error en el request:" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "   Status: $statusDescription" -ForegroundColor Yellow
    
    # Intentar obtener el mensaje de error del servidor
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Server Message: $($errorResponse.message)" -ForegroundColor Yellow
        
        if ($errorResponse.errors) {
            Write-Host "   Errores de validación:" -ForegroundColor Yellow
            $errorResponse.errors | ForEach-Object {
                Write-Host "     - $($_.field): $($_.message)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "   Error details: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🏁 Prueba finalizada" -ForegroundColor Green
