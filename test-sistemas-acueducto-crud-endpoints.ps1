# Test de Endpoints HTTP para Sistemas de Acueducto CRUD
# Ejecutar con PowerShell

# Configuración
$baseUrl = "http://localhost:3000/api/catalog/sistemas-acueducto"
$token = "YOUR_JWT_TOKEN_HERE"  # Reemplazar con un token válido
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "🧪 Iniciando tests de endpoints HTTP para Sistemas de Acueducto CRUD" -ForegroundColor Green
Write-Host ""

# Test 1: GET - Obtener todos los sistemas
Write-Host "📋 Test 1: GET - Obtener todos los sistemas" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method GET -Headers $headers
    Write-Host "✅ Status: Success" -ForegroundColor Green
    Write-Host "   Total sistemas: $($response.data.total)" -ForegroundColor White
    Write-Host "   Primer sistema: $($response.data.sistemas[0].nombre)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: POST - Crear nuevo sistema
Write-Host "➕ Test 2: POST - Crear nuevo sistema" -ForegroundColor Yellow
$nuevoSistema = @{
    nombre = "Test Sistema API $(Get-Date -Format 'yyyyMMdd_HHmmss')"
    descripcion = "Sistema creado via test de API REST"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $nuevoSistema
    $sistemaId = $response.data.id_sistema_acueducto
    Write-Host "✅ Sistema creado exitosamente" -ForegroundColor Green
    Write-Host "   ID: $sistemaId" -ForegroundColor White
    Write-Host "   Nombre: $($response.data.nombre)" -ForegroundColor White
    
    # Guardar ID para tests posteriores
    $global:testSistemaId = $sistemaId
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Detalles: $errorBody" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: GET - Obtener sistema por ID
if ($global:testSistemaId) {
    Write-Host "👁️ Test 3: GET - Obtener sistema por ID" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$global:testSistemaId" -Method GET -Headers $headers
        Write-Host "✅ Sistema obtenido exitosamente" -ForegroundColor Green
        Write-Host "   ID: $($response.data.id_sistema_acueducto)" -ForegroundColor White
        Write-Host "   Nombre: $($response.data.nombre)" -ForegroundColor White
        Write-Host "   Descripción: $($response.data.descripcion)" -ForegroundColor White
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 4: PUT - Actualizar sistema
if ($global:testSistemaId) {
    Write-Host "✏️ Test 4: PUT - Actualizar sistema" -ForegroundColor Yellow
    $updateData = @{
        nombre = "Test Sistema API Actualizado $(Get-Date -Format 'HH:mm:ss')"
        descripcion = "Descripción actualizada via test de API REST"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$global:testSistemaId" -Method PUT -Headers $headers -Body $updateData
        Write-Host "✅ Sistema actualizado exitosamente" -ForegroundColor Green
        Write-Host "   Nuevo nombre: $($response.data.nombre)" -ForegroundColor White
        Write-Host "   Nueva descripción: $($response.data.descripcion)" -ForegroundColor White
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: GET - Buscar sistemas
Write-Host "🔍 Test 5: GET - Buscar sistemas" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/search?query=Test" -Method GET -Headers $headers
    Write-Host "✅ Búsqueda completada" -ForegroundColor Green
    Write-Host "   Sistemas encontrados: $($response.data.total)" -ForegroundColor White
    Write-Host "   Término de búsqueda: $($response.data.searchTerm)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: GET - Obtener nombres únicos
Write-Host "📝 Test 6: GET - Obtener nombres únicos" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/nombres" -Method GET -Headers $headers
    Write-Host "✅ Nombres obtenidos exitosamente" -ForegroundColor Green
    Write-Host "   Total nombres únicos: $($response.data.Count)" -ForegroundColor White
    Write-Host "   Primeros nombres: $($response.data[0..2] -join ', ')" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: GET - Obtener estadísticas
Write-Host "📊 Test 7: GET - Obtener estadísticas" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/statistics" -Method GET -Headers $headers
    Write-Host "✅ Estadísticas obtenidas exitosamente" -ForegroundColor Green
    Write-Host "   Total: $($response.data.total)" -ForegroundColor White
    Write-Host "   Con descripción: $($response.data.totalWithDescription)" -ForegroundColor White
    Write-Host "   Sin descripción: $($response.data.withoutDescription)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: POST - Creación masiva
Write-Host "📦 Test 8: POST - Creación masiva" -ForegroundColor Yellow
$sistemasBulk = @{
    sistemas = @(
        @{
            nombre = "Bulk Test 1 $(Get-Date -Format 'HHmmss')"
            descripcion = "Sistema creado en lote 1"
        },
        @{
            nombre = "Bulk Test 2 $(Get-Date -Format 'HHmmss')"
            descripcion = "Sistema creado en lote 2"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/bulk" -Method POST -Headers $headers -Body $sistemasBulk
    Write-Host "✅ Creación masiva exitosa" -ForegroundColor Green
    Write-Host "   Sistemas creados: $($response.data.count)" -ForegroundColor White
    $global:bulkIds = $response.data.created | ForEach-Object { $_.id_sistema_acueducto }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: Pruebas de validación (errores esperados)
Write-Host "🚫 Test 9: Pruebas de validación" -ForegroundColor Yellow

# Test 9a: Crear sistema sin nombre
Write-Host "   9a: Crear sistema sin nombre (debe fallar)" -ForegroundColor Cyan
$sistemaInvalido = @{
    descripcion = "Sistema sin nombre"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method POST -Headers $headers -Body $sistemaInvalido
    Write-Host "   ❌ ERROR: Se permitió crear sistema sin nombre" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Validación correcta: Se rechazó el sistema sin nombre" -ForegroundColor Green
}

# Test 9b: Obtener sistema con ID inválido
Write-Host "   9b: Obtener sistema con ID inválido (debe fallar)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/999999" -Method GET -Headers $headers
    Write-Host "   ❌ ERROR: Se encontró sistema con ID inexistente" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Validación correcta: Sistema no encontrado" -ForegroundColor Green
}
Write-Host ""

# Test 10: DELETE - Eliminar sistemas de prueba
Write-Host "🗑️ Test 10: DELETE - Limpiar sistemas de prueba" -ForegroundColor Yellow

# Eliminar sistema principal de prueba
if ($global:testSistemaId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$global:testSistemaId" -Method DELETE -Headers $headers
        Write-Host "✅ Sistema principal eliminado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error eliminando sistema principal: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Eliminar sistemas creados en lote
if ($global:bulkIds) {
    foreach ($id in $global:bulkIds) {
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/$id" -Method DELETE -Headers $headers
            Write-Host "✅ Sistema bulk $id eliminado" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error eliminando sistema bulk $id" -ForegroundColor Red
        }
    }
}
Write-Host ""

Write-Host "🎉 Tests de endpoints HTTP completados!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumen de operaciones CRUD testadas:" -ForegroundColor Cyan
Write-Host "   ✅ CREATE (POST) - Crear sistema individual" -ForegroundColor White
Write-Host "   ✅ READ (GET) - Leer todos los sistemas" -ForegroundColor White
Write-Host "   ✅ READ (GET) - Leer sistema por ID" -ForegroundColor White
Write-Host "   ✅ UPDATE (PUT) - Actualizar sistema" -ForegroundColor White
Write-Host "   ✅ DELETE (DELETE) - Eliminar sistema" -ForegroundColor White
Write-Host "   ✅ Operaciones adicionales (búsqueda, estadísticas, etc.)" -ForegroundColor White
Write-Host "   ✅ Validaciones y manejo de errores" -ForegroundColor White
Write-Host ""
Write-Host "💡 Nota: Reemplace 'YOUR_JWT_TOKEN_HERE' con un token JWT válido" -ForegroundColor Yellow
