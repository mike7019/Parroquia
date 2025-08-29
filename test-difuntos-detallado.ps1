# Prueba Detallada del Endpoint Difuntos Consolidados
# ====================================================

Write-Host "🔍 ANÁLISIS DETALLADO - DIFUNTOS CONSOLIDADOS" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Autenticación
$loginData = '{"email": "admin@parroquia.com", "password": "Admin123!"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.access_token
$headers = @{ "Authorization" = "Bearer $token"; "Accept" = "application/json" }

Write-Host "✅ Autenticación exitosa" -ForegroundColor Green

# Función para probar endpoints
function Test-DifuntosEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Headers
    )
    
    Write-Host "`n🧪 Probando: $Name" -ForegroundColor Yellow
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Headers $Headers -ErrorAction Stop
        Write-Host "   ✅ Status: EXITOSO" -ForegroundColor Green
        
        if ($response.datos) {
            Write-Host "   📊 Datos obtenidos: $($response.datos.Count) registros" -ForegroundColor Cyan
            Write-Host "   📈 Total en DB: $($response.total)" -ForegroundColor Cyan
        }
        
        if ($response.estadisticas) {
            Write-Host "   📊 Estadísticas incluidas" -ForegroundColor Cyan
        }
        
        return $response
    } catch {
        Write-Host "   ❌ Status: ERROR" -ForegroundColor Red
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Pruebas específicas del endpoint de difuntos
$baseUrl = "http://localhost:3000/api/difuntos"

# 1. Consulta básica
$basica = Test-DifuntosEndpoint -Name "Consulta Básica" -Url "$baseUrl?limite=10" -Headers $headers

# 2. Filtro por parentesco - Madres
$madres = Test-DifuntosEndpoint -Name "Filtro Parentesco - Madres" -Url "$baseUrl?parentesco=madre&limite=5" -Headers $headers

# 3. Filtro por parentesco - Padres  
$padres = Test-DifuntosEndpoint -Name "Filtro Parentesco - Padres" -Url "$baseUrl?parentesco=padre&limite=5" -Headers $headers

# 4. Filtro por mes (agosto)
$agosto = Test-DifuntosEndpoint -Name "Filtro Mes - Agosto" -Url "$baseUrl?mes_aniversario=8&limite=5" -Headers $headers

# 5. Filtro por sector
$sector = Test-DifuntosEndpoint -Name "Filtro por Sector" -Url "$baseUrl?sector=centro&limite=5" -Headers $headers

# 6. Filtro por municipio
$municipio = Test-DifuntosEndpoint -Name "Filtro por Municipio" -Url "$baseUrl?municipio=barbacoas&limite=5" -Headers $headers

# 7. Estadísticas consolidadas
$stats = Test-DifuntosEndpoint -Name "Estadísticas Consolidadas" -Url "$baseUrl/estadisticas" -Headers $headers

# 8. Próximos aniversarios
$proximos = Test-DifuntosEndpoint -Name "Próximos Aniversarios" -Url "$baseUrl/proximos-aniversarios" -Headers $headers

Write-Host "`n📋 RESUMEN DE PRUEBAS - DIFUNTOS CONSOLIDADOS:" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

$pruebas = @(
    @{Nombre="Consulta Básica"; Resultado=$basica},
    @{Nombre="Madres"; Resultado=$madres},
    @{Nombre="Padres"; Resultado=$padres},
    @{Nombre="Por Mes"; Resultado=$agosto},
    @{Nombre="Por Sector"; Resultado=$sector},
    @{Nombre="Por Municipio"; Resultado=$municipio},
    @{Nombre="Estadísticas"; Resultado=$stats},
    @{Nombre="Próximos Aniversarios"; Resultado=$proximos}
)

$exitosas = 0
foreach ($prueba in $pruebas) {
    if ($prueba.Resultado) {
        Write-Host "✅ $($prueba.Nombre): FUNCIONANDO" -ForegroundColor Green
        $exitosas++
    } else {
        Write-Host "❌ $($prueba.Nombre): ERROR" -ForegroundColor Red
    }
}

Write-Host "`n🎯 RESULTADO FINAL:" -ForegroundColor Magenta
Write-Host "   Pruebas exitosas: $exitosas/8" -ForegroundColor Cyan
Write-Host "   Porcentaje éxito: $([math]::Round(($exitosas/8)*100, 1))%" -ForegroundColor Cyan

if ($exitosas -eq 8) {
    Write-Host "`n🎉 DIFUNTOS CONSOLIDADOS: 100% OPERATIVO" -ForegroundColor Magenta
} else {
    Write-Host "`n⚠️ Algunas funcionalidades requieren revisión" -ForegroundColor Yellow
}

Write-Host "`n📚 Documentación:" -ForegroundColor Yellow
Write-Host "   Swagger UI: http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host "   Sección: 'Difuntos Consolidado'" -ForegroundColor Cyan
