/**
 * Pruebas de endpoints HTTP para Aguas Residuales
 * Ejecutar desde PowerShell en la raíz del proyecto: .\test-aguas-residuales-endpoints.ps1
 */

$baseUrl = "http://localhost:3000"
$token = $null

# Función para hacer login y obtener token
function Get-AuthToken {
    Write-Host "🔐 Obteniendo token de autenticación..." -ForegroundColor Yellow
    
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        if ($response.success -and $response.data.token) {
            Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green
            return $response.data.token
        } else {
            Write-Host "❌ Error obteniendo token: $($response.message)" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para hacer requests autenticados
function Invoke-AuthenticatedRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body $Body
        } else {
            return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers
        }
    } catch {
        Write-Host "❌ Error en request: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función principal de pruebas
function Test-AguasResidualesEndpoints {
    Write-Host "🧪 Iniciando pruebas de endpoints de Aguas Residuales..." -ForegroundColor Cyan
    Write-Host ""
    
    # Obtener token
    $global:token = Get-AuthToken
    if (-not $token) {
        Write-Host "❌ No se pudo obtener token. Abortando pruebas." -ForegroundColor Red
        return
    }
    
    # Test 1: GET /api/catalog/aguas-residuales
    Write-Host "📋 Test 1: Obtener todos los tipos de aguas residuales" -ForegroundColor Yellow
    $response = Invoke-AuthenticatedRequest -Uri "$baseUrl/api/catalog/aguas-residuales"
    if ($response -and $response.success) {
        Write-Host "✅ Obtenidos $($response.data.tiposAguasResiduales.Count) tipos" -ForegroundColor Green
        $response.data.tiposAguasResiduales | ForEach-Object {
            Write-Host "   - ID: $($_.id_tipo_aguas_residuales), Nombre: $($_.nombre)" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    # Test 2: GET /api/catalog/aguas-residuales/search
    Write-Host "🔍 Test 2: Búsqueda de tipos de aguas residuales" -ForegroundColor Yellow
    $response = Invoke-AuthenticatedRequest -Uri "$baseUrl/api/catalog/aguas-residuales/search?q=alcantarillado"
    if ($response -and $response.success) {
        Write-Host "✅ Encontrados $($response.data.Count) resultados para 'alcantarillado'" -ForegroundColor Green
        $response.data | ForEach-Object {
            Write-Host "   - $($_.nombre): $($_.descripcion)" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    # Test 3: GET /api/catalog/aguas-residuales/stats
    Write-Host "📊 Test 3: Obtener estadísticas" -ForegroundColor Yellow
    $response = Invoke-AuthenticatedRequest -Uri "$baseUrl/api/catalog/aguas-residuales/stats"
    if ($response -and $response.success) {
        Write-Host "✅ Estadísticas obtenidas:" -ForegroundColor Green
        Write-Host "   - Total tipos: $($response.data.totalTipos)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Test 4: GET /api/catalog/aguas-residuales/:id
    Write-Host "📄 Test 4: Obtener tipo por ID" -ForegroundColor Yellow
    $response = Invoke-AuthenticatedRequest -Uri "$baseUrl/api/catalog/aguas-residuales/1"
    if ($response -and $response.success) {
        Write-Host "✅ Tipo obtenido: $($response.data.nombre)" -ForegroundColor Green
        Write-Host "   - Descripción: $($response.data.descripcion)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Test 5: POST /api/catalog/aguas-residuales (crear nuevo)
    Write-Host "➕ Test 5: Crear nuevo tipo de aguas residuales" -ForegroundColor Yellow
    $newTipoData = @{
        nombre = "Planta de Tratamiento Terciario"
        descripcion = "Sistema avanzado de tratamiento terciario con tecnología de última generación"
    } | ConvertTo-Json
    
    $response = Invoke-AuthenticatedRequest -Uri "$baseUrl/api/catalog/aguas-residuales" -Method "POST" -Body $newTipoData
    if ($response -and $response.success) {
        $newTipoId = $response.data.id_tipo_aguas_residuales
        Write-Host "✅ Nuevo tipo creado con ID: $newTipoId" -ForegroundColor Green
        
        # Test 6: PUT /api/catalog/aguas-residuales/:id (actualizar)
        Write-Host "✏️ Test 6: Actualizar tipo de aguas residuales" -ForegroundColor Yellow
        $updateData = @{
            nombre = "Planta de Tratamiento Terciario Avanzado"
            descripcion = "Sistema de tratamiento terciario con bio-reactores y filtración avanzada"
        } | ConvertTo-Json
        
        $response = Invoke-AuthenticatedRequest -Uri "$baseUrl/api/catalog/aguas-residuales/$newTipoId" -Method "PUT" -Body $updateData
        if ($response -and $response.success) {
            Write-Host "✅ Tipo actualizado: $($response.data.nombre)" -ForegroundColor Green
        }
        Write-Host ""
        
        # Test 7: DELETE /api/catalog/aguas-residuales/:id (eliminar)
        Write-Host "🗑️ Test 7: Eliminar tipo de aguas residuales" -ForegroundColor Yellow
        $response = Invoke-AuthenticatedRequest -Uri "$baseUrl/api/catalog/aguas-residuales/$newTipoId" -Method "DELETE"
        if ($response -and $response.success) {
            Write-Host "✅ $($response.data.message)" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️ No se pudo crear tipo de prueba, omitiendo tests de actualización y eliminación" -ForegroundColor Yellow
    }
    Write-Host ""
    
    Write-Host "🎉 Todas las pruebas de endpoints completadas!" -ForegroundColor Green
}

# Ejecutar las pruebas
Test-AguasResidualesEndpoints
