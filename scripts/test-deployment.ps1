# Test deployment script for Jenkins pipeline
# Verifica que todos los componentes estén funcionando

param(
    [string]$ServerIP = "206.62.139.100",
    [string]$Port = "3000"
)

Write-Host "🧪 VERIFICANDO DESPLIEGUE DE JENKINS" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://${ServerIP}:${Port}"

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        Write-Host "🔍 Probando $Name..." -ForegroundColor Cyan
        
        if ($Method -eq "POST" -and $Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -Body $Body -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -TimeoutSec 10
        }
        
        Write-Host "✅ $Name - OK" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ $Name - FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test 1: Health Check
$healthUrl = "$baseUrl/api/health"
$healthResult = Test-Endpoint -Url $healthUrl -Name "Health Check"

if (-not $healthResult) {
    Write-Host "❌ La aplicación no está respondiendo. Verificando posibles causas..." -ForegroundColor Red
    Write-Host "   - ¿Está el contenedor ejecutándose?" -ForegroundColor Yellow
    Write-Host "   - ¿Está el puerto 3000 abierto?" -ForegroundColor Yellow
    Write-Host "   - ¿Hay errores en los logs?" -ForegroundColor Yellow
    exit 1
}

# Test 2: Login endpoint
$loginUrl = "$baseUrl/api/auth/login"
$loginHeaders = @{
    "Content-Type" = "application/json"
}
$loginBody = @{
    correo_electronico = "admin@test.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

$loginResult = Test-Endpoint -Url $loginUrl -Name "Login Endpoint" -Method "POST" -Headers $loginHeaders -Body $loginBody

# Test 3: Veredas endpoint (requiere autenticación, pero probamos sin token para ver si responde)
$veredasUrl = "$baseUrl/api/catalog/veredas"
$veredasResult = Test-Endpoint -Url $veredasUrl -Name "Veredas Endpoint (sin auth)"

# Test 4: Municipios endpoint
$municipiosUrl = "$baseUrl/api/catalog/municipios"
$municipiosResult = Test-Endpoint -Url $municipiosUrl -Name "Municipios Endpoint (sin auth)"

Write-Host ""
Write-Host "📊 RESUMEN DE PRUEBAS" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow

$results = @(
    @{ Name = "Health Check"; Result = $healthResult }
    @{ Name = "Login"; Result = $loginResult }
    @{ Name = "Veredas"; Result = $veredasResult }
    @{ Name = "Municipios"; Result = $municipiosResult }
)

$passedTests = 0
foreach ($result in $results) {
    $status = if ($result.Result) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($result.Result) { "Green" } else { "Red" }
    Write-Host "$($result.Name): $status" -ForegroundColor $color
    
    if ($result.Result) { $passedTests++ }
}

Write-Host ""
Write-Host "Pruebas exitosas: $passedTests de $($results.Count)" -ForegroundColor White

if ($passedTests -eq $results.Count) {
    Write-Host "🎉 ¡TODOS LOS TESTS PASARON! El despliegue fue exitoso." -ForegroundColor Green
} elseif ($passedTests -gt 0) {
    Write-Host "⚠️  Algunos tests fallaron. Revisa los logs del servidor." -ForegroundColor Yellow
} else {
    Write-Host "❌ Todos los tests fallaron. El despliegue tiene problemas graves." -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 URLs importantes:" -ForegroundColor Cyan
Write-Host "Health: $baseUrl/api/health" -ForegroundColor Gray
Write-Host "API Docs: $baseUrl/api-docs" -ForegroundColor Gray
Write-Host "Login: $baseUrl/api/auth/login" -ForegroundColor Gray
Write-Host ""
