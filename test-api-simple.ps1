# Script de Pruebas Finales API Parroquia
# ==========================================

Write-Host "INICIANDO PRUEBAS FINALES DE API" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

# Test 1: Health Check
Write-Host ""
Write-Host "1. HEALTH CHECK" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest "$apiUrl/health"
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "Status: $($healthData.status)" -ForegroundColor Green
    Write-Host "Uptime: $($healthData.uptime) seconds" -ForegroundColor Cyan
    Write-Host "Version: $($healthData.version)" -ForegroundColor Cyan
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Authentication
Write-Host ""
Write-Host "2. AUTENTICACION" -ForegroundColor Yellow
$loginData = @{
    email = "admin@parroquia.com"
    password = "admin123"
} | ConvertTo-Json -Compress

try {
    $loginResponse = Invoke-WebRequest -Uri "$apiUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $token = $loginResult.token
    Write-Host "Login exitoso" -ForegroundColor Green
    Write-Host "Token obtenido: $($token.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers para requests autenticados
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 3: Catalog Endpoints
Write-Host ""
Write-Host "3. ENDPOINTS DE CATALOGO" -ForegroundColor Yellow

# Test Sexos
try {
    $sexosResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/sexos" -Headers $headers
    $sexosData = $sexosResponse.Content | ConvertFrom-Json
    Write-Host "Sexos: $($sexosData.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "Sexos failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Sectores
try {
    $sectoresResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/sectores" -Headers $headers
    $sectoresData = $sectoresResponse.Content | ConvertFrom-Json
    Write-Host "Sectores: $($sectoresData.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "Sectores failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Parroquias
try {
    $parroquiasResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/parroquias" -Headers $headers
    $parroquiasData = $parroquiasResponse.Content | ConvertFrom-Json
    Write-Host "Parroquias: $($parroquiasData.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "Parroquias failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Departamentos
try {
    $deptosResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/departamentos" -Headers $headers
    $deptosData = $deptosResponse.Content | ConvertFrom-Json
    Write-Host "Departamentos: $($deptosData.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "Departamentos failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: CRUD Operation
Write-Host ""
Write-Host "4. PRUEBA DE CRUD - CREATE" -ForegroundColor Yellow
$timestamp = Get-Date -Format "HHmmss"
$testSexo = @{
    descripcion = "Test Sexo $timestamp"
} | ConvertTo-Json -Compress

try {
    $createResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/sexos" -Method POST -Body $testSexo -Headers $headers
    $createResult = $createResponse.Content | ConvertFrom-Json
    $testId = $createResult.data.id
    Write-Host "CREATE: Nuevo registro creado con ID $testId" -ForegroundColor Green
    
    # Test Update
    $updateTimestamp = Get-Date -Format "HHmmss"
    $updateSexo = @{
        descripcion = "Test Sexo Updated $updateTimestamp"
    } | ConvertTo-Json -Compress
    
    $updateResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/sexos/$testId" -Method PUT -Body $updateSexo -Headers $headers
    Write-Host "UPDATE: Registro $testId actualizado" -ForegroundColor Green
    
    # Test Delete
    $deleteResponse = Invoke-WebRequest -Uri "$apiUrl/catalog/sexos/$testId" -Method DELETE -Headers $headers
    Write-Host "DELETE: Registro $testId eliminado" -ForegroundColor Green
    
} catch {
    Write-Host "CRUD operation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Swagger Documentation
Write-Host ""
Write-Host "5. DOCUMENTACION SWAGGER" -ForegroundColor Yellow
try {
    $swaggerResponse = Invoke-WebRequest "$baseUrl/api-docs/"
    if ($swaggerResponse.StatusCode -eq 200) {
        Write-Host "Swagger UI accesible en $baseUrl/api-docs/" -ForegroundColor Green
    }
} catch {
    Write-Host "Swagger UI no accesible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "Revisa los resultados arriba para validar que todos los servicios funcionan correctamente." -ForegroundColor Cyan
