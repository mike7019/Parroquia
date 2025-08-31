# Script de Pruebas para Endpoints de Departamentos API
# Autor: Sistema Parroquia
# Fecha: $(Get-Date -Format "yyyy-MM-dd")

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Email = "admin@parroquia.com", 
    [string]$Password = "Admin123!"
)

Write-Host "🧪 INICIANDO PRUEBAS DE ENDPOINTS - DEPARTAMENTOS API" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🌐 URL Base: $BaseUrl" -ForegroundColor Yellow
Write-Host "👤 Usuario: $Email" -ForegroundColor Yellow
Write-Host ""

# Función para mostrar resultados
function Show-TestResult {
    param($TestName, $Success, $Data, $ErrorMsg = $null)
    
    if ($Success) {
        Write-Host "✅ $TestName" -ForegroundColor Green
        if ($Data) {
            Write-Host "   📊 Datos: $($Data | ConvertTo-Json -Depth 1 -Compress)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ $TestName" -ForegroundColor Red
        if ($ErrorMsg) {
            Write-Host "   💥 Error: $ErrorMsg" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Función para hacer pausa entre pruebas
function Wait-NextTest {
    param($seconds = 2)
    Write-Host "⏳ Esperando $seconds segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds $seconds
}

try {
    # PASO 1: Autenticación
    Write-Host "🔐 PASO 1: Obteniendo token de autenticación..." -ForegroundColor Magenta
    
    $loginBody = @{
        correo_electronico = $Email
        contrasena = $Password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.data.accessToken
    $headers = @{Authorization = "Bearer $token"}
    
    Show-TestResult "Autenticación exitosa" $true @{token = $token.Substring(0, 20) + "..."}
    
    Wait-NextTest
    
    # PASO 2: GET /api/catalog/departamentos (Listar todos)
    Write-Host "📋 PASO 2: Probando GET /api/catalog/departamentos" -ForegroundColor Magenta
    
    try {
        $allDepartamentos = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos" -Method GET -Headers $headers
        Show-TestResult "GET /api/catalog/departamentos" $true @{
            total = $allDepartamentos.total
            status = $allDepartamentos.status
            primerDepartamento = $allDepartamentos.data[0].nombre
        }
    } catch {
        Show-TestResult "GET /api/catalog/departamentos" $false $null $_.Exception.Message
    }
    
    Wait-NextTest
    
    # PASO 3: GET /api/catalog/departamentos/search?q=anti (Búsqueda)
    Write-Host "🔍 PASO 3: Probando GET /api/catalog/departamentos/search?q=anti" -ForegroundColor Magenta
    
    try {
        $searchDepartamentos = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/search?q=anti" -Method GET -Headers $headers
        Show-TestResult "GET /search?q=anti" $true @{
            total = $searchDepartamentos.total
            encontrados = ($searchDepartamentos.data | ForEach-Object { $_.nombre }) -join ", "
        }
    } catch {
        Show-TestResult "GET /search?q=anti" $false $null $_.Exception.Message
    }
    
    Wait-NextTest
    
    # PASO 4: GET /api/catalog/departamentos/statistics (Estadísticas)
    Write-Host "📊 PASO 4: Probando GET /api/catalog/departamentos/statistics" -ForegroundColor Magenta
    
    try {
        $stats = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/statistics" -Method GET -Headers $headers
        Show-TestResult "GET /statistics" $true @{
            totalDepartamentos = $stats.datos.totalDepartamentos
            mensaje = $stats.mensaje
        }
    } catch {
        Show-TestResult "GET /statistics" $false $null $_.Exception.Message
    }
    
    Wait-NextTest
    
    # PASO 5: GET /api/catalog/departamentos/1 (Por ID)
    Write-Host "🎯 PASO 5: Probando GET /api/catalog/departamentos/1" -ForegroundColor Magenta
    
    try {
        $deptById = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/1" -Method GET -Headers $headers
        Show-TestResult "GET /departamentos/1" $true @{
            id = $deptById.datos.id_departamento
            nombre = $deptById.datos.nombre
            codigo_dane = $deptById.datos.codigo_dane
        }
    } catch {
        Show-TestResult "GET /departamentos/1" $false $null $_.Exception.Message
    }
    
    Wait-NextTest
    
    # PASO 6: GET /api/catalog/departamentos/codigo-dane/05 (Por código DANE)
    Write-Host "🏷️  PASO 6: Probando GET /api/catalog/departamentos/codigo-dane/05" -ForegroundColor Magenta
    
    try {
        $deptByDane = Invoke-RestMethod -Uri "$BaseUrl/api/catalog/departamentos/codigo-dane/05" -Method GET -Headers $headers
        Show-TestResult "GET /codigo-dane/05" $true @{
            nombre = $deptByDane.datos.nombre
            codigo_dane = $deptByDane.datos.codigo_dane
            id = $deptByDane.datos.id_departamento
        }
    } catch {
        Show-TestResult "GET /codigo-dane/05" $false $null $_.Exception.Message
    }
    
    # RESUMEN FINAL
    Write-Host ""
    Write-Host "🏁 PRUEBAS COMPLETADAS" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "✅ Todas las pruebas de endpoints han sido ejecutadas" -ForegroundColor Green
    Write-Host "📝 Revisa los resultados arriba para detalles específicos" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "💥 ERROR CRÍTICO EN LAS PRUEBAS" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Función adicional para pruebas individuales
function Test-SingleEndpoint {
    param(
        [string]$Endpoint,
        [string]$Description
    )
    
    Write-Host "🧪 Probando: $Description" -ForegroundColor Cyan
    Write-Host "🌐 URL: $BaseUrl$Endpoint" -ForegroundColor Gray
    
    try {
        # Obtener token fresco
        $loginBody = @{
            correo_electronico = $Email
            contrasena = $Password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
        $token = $loginResponse.data.accessToken
        $headers = @{Authorization = "Bearer $token"}
        
        # Ejecutar prueba
        $result = Invoke-RestMethod -Uri "$BaseUrl$Endpoint" -Method GET -Headers $headers
        Write-Host "✅ Éxito!" -ForegroundColor Green
        Write-Host "📊 Resultado:" -ForegroundColor Yellow
        $result | ConvertTo-Json -Depth 3
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "💡 Para probar un endpoint individual, usa:" -ForegroundColor Cyan
Write-Host "   Test-SingleEndpoint '/api/catalog/departamentos' 'Listar todos los departamentos'" -ForegroundColor Gray
Write-Host ""
