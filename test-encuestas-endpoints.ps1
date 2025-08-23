# Script para probar los endpoints de encuestas
# Fecha: 2025-08-22

$baseUrl = "http://localhost:3000/api"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🧪 INICIANDO PRUEBAS DE ENDPOINTS DE ENCUESTAS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# 1. Realizar login para obtener token
Write-Host "🔐 Paso 1: Realizando login..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -Headers $headers -ErrorAction Stop
    $token = $loginResponse.data.accessToken
    
    # Agregar token a headers
    $headers["Authorization"] = "Bearer $token"
    
    Write-Host "✅ Login exitoso. Token obtenido." -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    
    # Intentar con usuario por defecto alternativo
    Write-Host "🔄 Intentando con credenciales alternativas..." -ForegroundColor Yellow
    
    $loginData = @{
        email = "test@example.com"
        password = "123456"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -Headers $headers -ErrorAction Stop
        $token = $loginResponse.data.accessToken
        $headers["Authorization"] = "Bearer $token"
        Write-Host "✅ Login exitoso con credenciales alternativas." -ForegroundColor Green
    } catch {
        Write-Host "❌ Error en login alternativo: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "ℹ️  Por favor, verifica que exista un usuario válido en la base de datos." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# 2. Probar GET /api/encuesta (listar encuestas)
Write-Host "🔍 Paso 2: Probando GET /api/encuesta (listar encuestas)..." -ForegroundColor Yellow

try {
    $encuestasResponse = Invoke-RestMethod -Uri "$baseUrl/encuesta" -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ GET /api/encuesta exitoso" -ForegroundColor Green
    Write-Host "Total de encuestas: $($encuestasResponse.pagination.totalItems)" -ForegroundColor Cyan
    Write-Host "Página actual: $($encuestasResponse.pagination.currentPage)" -ForegroundColor Cyan
    Write-Host "Encuestas en esta página: $($encuestasResponse.data.Count)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error en GET /api/encuesta: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Código de estado: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Probar GET /api/encuesta con parámetros de paginación
Write-Host "🔍 Paso 3: Probando GET /api/encuesta con paginación..." -ForegroundColor Yellow

try {
    $encuestasPaginadasResponse = Invoke-RestMethod -Uri "$baseUrl/encuesta?page=1&limit=5" -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ GET /api/encuesta con paginación exitoso" -ForegroundColor Green
    Write-Host "Límite por página: 5" -ForegroundColor Cyan
    Write-Host "Encuestas obtenidas: $($encuestasPaginadasResponse.data.Count)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error en GET /api/encuesta con paginación: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Crear una nueva encuesta usando el JSON de prueba
Write-Host "📝 Paso 4: Probando POST /api/encuesta (crear nueva encuesta)..." -ForegroundColor Yellow

try {
    # Leer el archivo de prueba
    $testDataPath = "test-encuesta.json"
    if (Test-Path $testDataPath) {
        $testData = Get-Content $testDataPath -Raw
        
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/encuesta" -Method POST -Body $testData -Headers $headers -ErrorAction Stop
        
        $familiaId = $createResponse.data.familia_id
        
        Write-Host "✅ POST /api/encuesta exitoso" -ForegroundColor Green
        Write-Host "ID de familia creada: $familiaId" -ForegroundColor Cyan
        Write-Host "Personas creadas: $($createResponse.data.personas_creadas)" -ForegroundColor Cyan
        
        # Guardar el ID para las siguientes pruebas
        $global:testFamiliaId = $familiaId
        
    } else {
        Write-Host "⚠️  Archivo test-encuesta.json no encontrado. Saltando creación de encuesta." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error en POST /api/encuesta: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Detalles del error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 5. Probar GET /api/encuesta/:id (obtener encuesta específica)
Write-Host "🔍 Paso 5: Probando GET /api/encuesta/:id (obtener encuesta específica)..." -ForegroundColor Yellow

if ($global:testFamiliaId) {
    try {
        $encuestaResponse = Invoke-RestMethod -Uri "$baseUrl/encuesta/$global:testFamiliaId" -Method GET -Headers $headers -ErrorAction Stop
        
        Write-Host "✅ GET /api/encuesta/$global:testFamiliaId exitoso" -ForegroundColor Green
        Write-Host "Apellido familiar: $($encuestaResponse.data.apellido_familiar)" -ForegroundColor Cyan
        Write-Host "Total personas: $($encuestaResponse.data.estadisticas.total_personas)" -ForegroundColor Cyan
        Write-Host "Personas vivas: $($encuestaResponse.data.estadisticas.personas_vivas)" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Error en GET /api/encuesta/$global:testFamiliaId: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    # Intentar con ID 1 si existe
    try {
        $encuestaResponse = Invoke-RestMethod -Uri "$baseUrl/encuesta/1" -Method GET -Headers $headers -ErrorAction Stop
        
        Write-Host "✅ GET /api/encuesta/1 exitoso" -ForegroundColor Green
        Write-Host "Apellido familiar: $($encuestaResponse.data.apellido_familiar)" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ No se pudo probar GET por ID. No hay encuestas disponibles." -ForegroundColor Yellow
    }
}

Write-Host ""

# 6. Probar GET con filtros
Write-Host "🔍 Paso 6: Probando GET /api/encuesta con filtros..." -ForegroundColor Yellow

try {
    $encuestasFiltroResponse = Invoke-RestMethod -Uri "$baseUrl/encuesta?apellido_familiar=Pérez" -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ GET /api/encuesta con filtro de apellido exitoso" -ForegroundColor Green
    Write-Host "Encuestas encontradas: $($encuestasFiltroResponse.data.Count)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error en GET /api/encuesta con filtros: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 7. Verificar endpoint de health check
Write-Host "🏥 Paso 7: Verificando health check..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
    
    Write-Host "✅ Health check exitoso" -ForegroundColor Green
    Write-Host "Estado: $($healthResponse.status)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error en health check: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

Write-Host ""
Write-Host "📊 RESUMEN DE ENDPOINTS PROBADOS:" -ForegroundColor Cyan
Write-Host "• POST   /api/auth/login" -ForegroundColor White
Write-Host "• GET    /api/encuesta" -ForegroundColor White
Write-Host "• GET    /api/encuesta?page=1&limit=5" -ForegroundColor White
Write-Host "• POST   /api/encuesta" -ForegroundColor White
Write-Host "• GET    /api/encuesta/:id" -ForegroundColor White
Write-Host "• GET    /api/encuesta?apellido_familiar=Pérez" -ForegroundColor White
Write-Host "• GET    /api/health" -ForegroundColor White

Write-Host ""
Write-Host "✨ Las pruebas han finalizado. Revisa los resultados arriba." -ForegroundColor Green
