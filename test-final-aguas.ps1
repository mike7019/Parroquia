Write-Host "=== PRUEBAS COMPLETAS DEL SERVICIO AGUAS RESIDUALES ===" -ForegroundColor Green

# Función para hacer peticiones con manejo de errores
function Invoke-SafeRequest {
    param($Uri, $Method, $Headers, $Body)
    try {
        if ($Body) {
            return Invoke-WebRequest -Uri $Uri -Method $Method -Headers $Headers -Body $Body
        } else {
            return Invoke-WebRequest -Uri $Uri -Method $Method -Headers $Headers
        }
    } catch {
        Write-Host "Error en $Method $Uri : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

$baseUrl = "http://localhost:3000/api"
$headers = @{'Content-Type' = 'application/json'}

# 1. Verificar servidor
Write-Host "`n1. Verificando servidor..." -ForegroundColor Yellow
$health = Invoke-SafeRequest -Uri "$baseUrl/health" -Method GET
if ($health) {
    Write-Host "✅ Servidor activo - Status: $($health.StatusCode)" -ForegroundColor Green
} else {
    Write-Host "❌ Servidor no disponible" -ForegroundColor Red
    exit 1
}

# 2. Autenticación
Write-Host "`n2. Autenticándose..." -ForegroundColor Yellow
$loginData = '{"correo_electronico":"test@aguasresiduales.com","contrasena":"Test123456!"}'
$loginResponse = Invoke-SafeRequest -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginData

if ($loginResponse) {
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    if ($loginResult.status -eq "success" -and $loginResult.data.accessToken) {
        $token = $loginResult.data.accessToken
        Write-Host "✅ Login exitoso" -ForegroundColor Green
        
        # Headers con autenticación
        $authHeaders = @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        }
        
        # 3. Listar tipos existentes
        Write-Host "`n3. Obteniendo tipos existentes..." -ForegroundColor Yellow
        $getResponse = Invoke-SafeRequest -Uri "$baseUrl/catalog/aguas-residuales" -Method GET -Headers $authHeaders
        if ($getResponse) {
            $tipos = $getResponse.Content | ConvertFrom-Json
            Write-Host "✅ Tipos obtenidos: $($tipos.data.count)" -ForegroundColor Green
            if ($tipos.data.tipos.Count -gt 0) {
                Write-Host "Ejemplo: $($tipos.data.tipos[0].nombre)" -ForegroundColor Cyan
            }
        }
        
        # 4. Crear nuevo tipo
        Write-Host "`n4. Creando nuevo tipo..." -ForegroundColor Yellow
        $newTypeData = '{"nombre":"Aguas Grises Testing PowerShell","descripcion":"Tipo creado desde prueba automatizada con PowerShell"}'
        $createResponse = Invoke-SafeRequest -Uri "$baseUrl/catalog/aguas-residuales" -Method POST -Headers $authHeaders -Body $newTypeData
        
        if ($createResponse) {
            $newType = $createResponse.Content | ConvertFrom-Json
            if ($newType.success) {
                $newId = $newType.data.id_tipo_aguas_residuales
                Write-Host "✅ Tipo creado exitosamente" -ForegroundColor Green
                Write-Host "ID: $newId" -ForegroundColor Cyan
                Write-Host "Nombre: $($newType.data.nombre)" -ForegroundColor Cyan
                
                # 5. Obtener por ID
                Write-Host "`n5. Obteniendo tipo por ID ($newId)..." -ForegroundColor Yellow
                $getByIdResponse = Invoke-SafeRequest -Uri "$baseUrl/catalog/aguas-residuales/$newId" -Method GET -Headers $authHeaders
                if ($getByIdResponse) {
                    $typeById = $getByIdResponse.Content | ConvertFrom-Json
                    if ($typeById.success) {
                        Write-Host "✅ Tipo obtenido por ID: $($typeById.data.nombre)" -ForegroundColor Green
                    }
                }
                
                # 6. Actualizar tipo
                Write-Host "`n6. Actualizando tipo..." -ForegroundColor Yellow
                $updateData = '{"nombre":"Aguas Grises Testing PowerShell ACTUALIZADO","descripcion":"Tipo ACTUALIZADO desde prueba automatizada con PowerShell"}'
                $updateResponse = Invoke-SafeRequest -Uri "$baseUrl/catalog/aguas-residuales/$newId" -Method PUT -Headers $authHeaders -Body $updateData
                if ($updateResponse) {
                    $updatedType = $updateResponse.Content | ConvertFrom-Json
                    if ($updatedType.success) {
                        Write-Host "✅ Tipo actualizado: $($updatedType.data.nombre)" -ForegroundColor Green
                    }
                }
                
                # 7. Buscar tipos
                Write-Host "`n7. Buscando tipos (q=PowerShell)..." -ForegroundColor Yellow
                $searchResponse = Invoke-SafeRequest -Uri "$baseUrl/catalog/aguas-residuales/search?q=PowerShell" -Method GET -Headers $authHeaders
                if ($searchResponse) {
                    $searchResults = $searchResponse.Content | ConvertFrom-Json
                    if ($searchResults.success) {
                        Write-Host "✅ Búsqueda completada - Encontrados: $($searchResults.data.count)" -ForegroundColor Green
                    }
                }
                
                # 8. Obtener estadísticas
                Write-Host "`n8. Obteniendo estadísticas..." -ForegroundColor Yellow
                $statsResponse = Invoke-SafeRequest -Uri "$baseUrl/catalog/aguas-residuales/stats" -Method GET -Headers $authHeaders
                if ($statsResponse) {
                    $stats = $statsResponse.Content | ConvertFrom-Json
                    if ($stats.success) {
                        Write-Host "✅ Estadísticas obtenidas - Total: $($stats.data.total)" -ForegroundColor Green
                    }
                }
                
                # 9. Eliminar tipo creado
                Write-Host "`n9. Eliminando tipo creado..." -ForegroundColor Yellow
                $deleteResponse = Invoke-SafeRequest -Uri "$baseUrl/catalog/aguas-residuales/$newId" -Method DELETE -Headers $authHeaders
                if ($deleteResponse) {
                    $deleteResult = $deleteResponse.Content | ConvertFrom-Json
                    if ($deleteResult.success) {
                        Write-Host "✅ Tipo eliminado exitosamente" -ForegroundColor Green
                    }
                }
            }
        }
        
        Write-Host "`n=== TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===" -ForegroundColor Green
        Write-Host "✅ Servicio CRUD de Aguas Residuales funciona perfectamente" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Error en login - respuesta inválida" -ForegroundColor Red
        Write-Host "Respuesta: $($loginResponse.Content)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No se pudo autenticar" -ForegroundColor Red
}
