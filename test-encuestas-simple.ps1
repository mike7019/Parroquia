# Script para probar los endpoints de encuestas
Write-Host "🧪 INICIANDO PRUEBAS DE ENDPOINTS DE ENCUESTAS" -ForegroundColor Green

$baseUrl = "http://localhost:3000/api"
$headers = @{
    "Content-Type" = "application/json"
}

# 1. Login
Write-Host "🔐 Realizando login..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -Headers $headers
    $token = $loginResponse.data.accessToken
    $headers["Authorization"] = "Bearer $token"
    Write-Host "✅ Login exitoso" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    # Intentar con credenciales alternativas
    $loginData = @{
        email = "test@example.com"
        password = "123456"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -Headers $headers
        $token = $loginResponse.data.accessToken
        $headers["Authorization"] = "Bearer $token"
        Write-Host "✅ Login con credenciales alternativas exitoso" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ No se pudo hacer login" -ForegroundColor Red
        exit 1
    }
}

# 2. Test GET encuestas
Write-Host "🔍 Probando GET /api/encuesta..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/encuesta" -Method GET -Headers $headers
    Write-Host "✅ GET /api/encuesta exitoso" -ForegroundColor Green
    Write-Host "Total encuestas: $($response.pagination.totalItems)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error en GET encuestas: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test POST encuesta
Write-Host "📝 Probando POST /api/encuesta..." -ForegroundColor Yellow

if (Test-Path "test-encuesta.json") {
    try {
        $testData = Get-Content "test-encuesta.json" -Raw
        $response = Invoke-RestMethod -Uri "$baseUrl/encuesta" -Method POST -Body $testData -Headers $headers
        Write-Host "✅ POST /api/encuesta exitoso" -ForegroundColor Green
        Write-Host "Familia ID: $($response.data.familia_id)" -ForegroundColor Cyan
        $familiaId = $response.data.familia_id
    }
    catch {
        Write-Host "❌ Error en POST encuesta: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Test GET encuesta por ID
if ($familiaId) {
    Write-Host "🔍 Probando GET /api/encuesta/$familiaId..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/encuesta/$familiaId" -Method GET -Headers $headers
        Write-Host "✅ GET /api/encuesta/$familiaId exitoso" -ForegroundColor Green
        Write-Host "Apellido: $($response.data.apellido_familiar)" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Error en GET encuesta por ID: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 PRUEBAS COMPLETADAS" -ForegroundColor Green
