# 🧪 TESTING DE ENDPOINTS CONSOLIDADOS - FASE 1 (ALTA PRIORIDAD)
# Versión PowerShell - Proyecto Parroquia
# =============================================================================

param(
    [string]$BaseURL = "http://localhost:3000",
    [string]$TestUser = "admin@test.com",
    [string]$TestPassword = "admin123",
    [switch]$Verbose
)

# Configuración de colores para output
$GREEN = @{ForegroundColor = "Green"}
$RED = @{ForegroundColor = "Red"}
$YELLOW = @{ForegroundColor = "Yellow"}
$CYAN = @{ForegroundColor = "Cyan"}
$MAGENTA = @{ForegroundColor = "Magenta"}

Write-Host "🚀 INICIANDO PRUEBAS DE ENDPOINTS CONSOLIDADOS" @CYAN
Write-Host "=" * 60 @CYAN
Write-Host "📊 Base URL: $BaseURL" @YELLOW
Write-Host "👤 Usuario: $TestUser" @YELLOW
Write-Host ""

# Función para hacer peticiones HTTP con mejor manejo de errores
function Invoke-ApiRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Data = ($response.Content | ConvertFrom-Json)
            Headers = $response.Headers
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { "Unknown" }
        }
    }
}

# Función para mostrar resultados de pruebas
function Show-TestResult {
    param(
        [string]$TestName,
        [object]$Result,
        [switch]$ShowData
    )
    
    if ($Result.Success) {
        Write-Host "✅ $TestName" @GREEN
        Write-Host "   Status: $($Result.StatusCode)" @GREEN
        Write-Host "   Total: $($Result.Data.total)" @GREEN
        
        if ($ShowData -and $Result.Data.datos) {
            Write-Host "   Primeros 3 resultados:" @CYAN
            $Result.Data.datos | Select-Object -First 3 | ForEach-Object {
                Write-Host "   - $($_ | ConvertTo-Json -Compress)" @CYAN
            }
        }
        
        if ($Result.Data.estadisticas) {
            Write-Host "   Estadísticas disponibles: $($Result.Data.estadisticas.PSObject.Properties.Name -join ', ')" @MAGENTA
        }
    }
    else {
        Write-Host "❌ $TestName" @RED
        Write-Host "   Error: $($Result.Error)" @RED
        Write-Host "   Status: $($Result.StatusCode)" @RED
    }
    Write-Host ""
}

# PASO 1: Autenticación
Write-Host "🔐 PASO 1: AUTENTICACIÓN" @CYAN
Write-Host "-" * 30

$loginBody = @{
    correo_electronico = $TestUser
    password = $TestPassword
}

$loginResult = Invoke-ApiRequest -Uri "$BaseURL/api/auth/login" -Method "POST" -Body $loginBody

if (-not $loginResult.Success) {
    Write-Host "❌ ERROR CRÍTICO: No se pudo autenticar" @RED
    Write-Host "   Error: $($loginResult.Error)" @RED
    Write-Host "🛑 Deteniendo pruebas. Verificar servidor y credenciales." @RED
    exit 1
}

$authToken = $loginResult.Data.token
Write-Host "✅ Autenticación exitosa" @GREEN
Write-Host "   Token obtenido: $($authToken.Substring(0, 20))..." @GREEN
Write-Host ""

# Headers con autenticación
$authHeaders = @{
    "Authorization" = "Bearer $authToken"
}

# PASO 2: Testing Endpoint DIFUNTOS (95% listo)
Write-Host "🔥 PASO 2: TESTING ENDPOINT DIFUNTOS" @CYAN
Write-Host "-" * 40

# Test 1: Consulta básica de difuntos
$result1 = Invoke-ApiRequest -Uri "$BaseURL/api/difuntos" -Headers $authHeaders
Show-TestResult "Consulta básica de difuntos" $result1 -ShowData

# Test 2: Filtro por parentesco (Madre)
$result2 = Invoke-ApiRequest -Uri "$BaseURL/api/difuntos?parentesco=Madre" -Headers $authHeaders
Show-TestResult "Filtro por parentesco (Madre)" $result2

# Test 3: Filtro por parentesco (Padre)
$result3 = Invoke-ApiRequest -Uri "$BaseURL/api/difuntos?parentesco=Padre" -Headers $authHeaders
Show-TestResult "Filtro por parentesco (Padre)" $result3

# Test 4: Aniversarios próximos
$result4 = Invoke-ApiRequest -Uri "$BaseURL/api/difuntos/aniversarios?dias=60" -Headers $authHeaders
Show-TestResult "Aniversarios próximos (60 días)" $result4

# Test 5: Estadísticas de difuntos
$result5 = Invoke-ApiRequest -Uri "$BaseURL/api/difuntos/estadisticas" -Headers $authHeaders
Show-TestResult "Estadísticas de difuntos" $result5 -ShowData

# PASO 3: Testing Endpoint SALUD (90% listo)
Write-Host "🔥 PASO 3: TESTING ENDPOINT SALUD" @CYAN
Write-Host "-" * 35

# Test 6: Consulta básica de salud
$result6 = Invoke-ApiRequest -Uri "$BaseURL/api/personas/salud" -Headers $authHeaders
Show-TestResult "Consulta básica de salud" $result6 -ShowData

# Test 7: Filtro por enfermedad
$result7 = Invoke-ApiRequest -Uri "$BaseURL/api/personas/salud?enfermedad=diabetes" -Headers $authHeaders
Show-TestResult "Filtro por enfermedad (diabetes)" $result7

# Test 8: Filtro por rango de edad
$result8 = Invoke-ApiRequest -Uri "$BaseURL/api/personas/salud?rango_edad=60-80" -Headers $authHeaders
Show-TestResult "Filtro por rango de edad (60-80)" $result8

# Test 9: Estadísticas de salud
$result9 = Invoke-ApiRequest -Uri "$BaseURL/api/personas/salud/estadisticas" -Headers $authHeaders
Show-TestResult "Estadísticas de salud" $result9 -ShowData

# PASO 4: Testing Endpoint FAMILIAS (80% listo)
Write-Host "🔥 PASO 4: TESTING ENDPOINT FAMILIAS" @CYAN
Write-Host "-" * 38

# Test 10: Consulta básica de familias
$result10 = Invoke-ApiRequest -Uri "$BaseURL/api/familias" -Headers $authHeaders
Show-TestResult "Consulta básica de familias" $result10 -ShowData

# Test 11: Filtro por sexo femenino
$result11 = Invoke-ApiRequest -Uri "$BaseURL/api/familias?sexo=F" -Headers $authHeaders
Show-TestResult "Filtro por sexo femenino" $result11

# Test 12: Filtro por sexo masculino
$result12 = Invoke-ApiRequest -Uri "$BaseURL/api/familias?sexo=M" -Headers $authHeaders
Show-TestResult "Filtro por sexo masculino" $result12

# Test 13: Consulta específica de madres
$result13 = Invoke-ApiRequest -Uri "$BaseURL/api/familias/madres" -Headers $authHeaders
Show-TestResult "Consulta específica de madres" $result13

# Test 14: Consulta específica de padres
$result14 = Invoke-ApiRequest -Uri "$BaseURL/api/familias/padres" -Headers $authHeaders
Show-TestResult "Consulta específica de padres" $result14

# Test 15: Familias sin padre
$result15 = Invoke-ApiRequest -Uri "$BaseURL/api/familias/sin-padre" -Headers $authHeaders
Show-TestResult "Familias sin padre" $result15

# Test 16: Familias sin madre
$result16 = Invoke-ApiRequest -Uri "$BaseURL/api/familias/sin-madre" -Headers $authHeaders
Show-TestResult "Familias sin madre" $result16

# Test 17: Estadísticas de familias
$result17 = Invoke-ApiRequest -Uri "$BaseURL/api/familias/estadisticas" -Headers $authHeaders
Show-TestResult "Estadísticas de familias" $result17 -ShowData

# PASO 5: Pruebas de integración y comparación
Write-Host "🔧 PASO 5: PRUEBAS DE INTEGRACIÓN" @CYAN
Write-Host "-" * 35

# Verificar consistencia geográfica
$municipios = @("Medellín", "Bello", "Envigado", "Itagüí", "Sabaneta")

foreach ($municipio in $municipios) {
    $resultMunicipio = Invoke-ApiRequest -Uri "$BaseURL/api/familias?municipio=$municipio&limite=5" -Headers $authHeaders
    if ($resultMunicipio.Success) {
        Write-Host "📍 $municipio : $($resultMunicipio.Data.total) personas" @MAGENTA
    } else {
        Write-Host "📍 $municipio : Error en consulta" @RED
    }
}

# PASO 6: Resumen final
Write-Host ""
Write-Host "📊 RESUMEN FINAL DE FASE 1 - ALTA PRIORIDAD" @CYAN
Write-Host "=" * 60 @CYAN

$allResults = @($result1, $result2, $result3, $result4, $result5, $result6, $result7, $result8, $result9, $result10, $result11, $result12, $result13, $result14, $result15, $result16, $result17)
$successCount = ($allResults | Where-Object { $_.Success }).Count
$totalTests = $allResults.Count

Write-Host "✅ Pruebas exitosas: $successCount / $totalTests" @GREEN
Write-Host "📈 Porcentaje de éxito: $([math]::Round(($successCount / $totalTests) * 100, 2))%" @GREEN

if ($successCount -eq $totalTests) {
    Write-Host "🎯 ¡TODAS LAS PRUEBAS PASARON!" @GREEN
    Write-Host "🚀 Estado: LISTOS PARA PRODUCCIÓN" @GREEN
} elseif ($successCount -ge ($totalTests * 0.8)) {
    Write-Host "⚠️  Mayoría de pruebas exitosas - Revisar fallos menores" @YELLOW
} else {
    Write-Host "❌ Múltiples fallos detectados - Revisar implementación" @RED
}

Write-Host ""
Write-Host "📝 Próximo paso: Implementar Fase 2 (Prioridad Media)" @CYAN
Write-Host "🔗 Documentación: /api-docs" @CYAN
Write-Host ""
Write-Host "✨ Fin de las pruebas - $(Get-Date)" @CYAN
