#!/usr/bin/env pwsh

Write-Host "🧪 Probando el CRUD de Municipios y Departamentos..." -ForegroundColor Cyan
Write-Host ""

# Configuración de la URL base
$baseUrl = "http://localhost:3000/api"
$authUrl = "$baseUrl/auth/login"
$departamentosUrl = "$baseUrl/catalog/departamentos"
$municipiosUrl = "$baseUrl/catalog/municipios"

# Headers comunes
$headers = @{
    "Content-Type" = "application/json"
}

# Función para realizar peticiones HTTP
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "❌ Error en petición: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   Código de estado: $statusCode" -ForegroundColor Yellow
        }
        return $null
    }
}

# 1. Autenticación
Write-Host "🔐 1. Autenticando usuario..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@parroquia.com"
    password = "Admin123!"
} | ConvertTo-Json

$authResponse = Invoke-ApiRequest -Method POST -Uri $authUrl -Headers $headers -Body $loginData

if (-not $authResponse) {
    Write-Host "❌ Error en autenticación. Verifica que el servidor esté corriendo y que exista un usuario admin." -ForegroundColor Red
    exit 1
}

if ($authResponse.status -eq "success" -and $authResponse.data.accessToken) {
    $token = $authResponse.data.accessToken
    $headers["Authorization"] = "Bearer $token"
    Write-Host "✅ Autenticación exitosa" -ForegroundColor Green
} else {
    Write-Host "❌ Error en autenticación: $($authResponse.message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Listar todos los departamentos
Write-Host "📋 2. Listando departamentos..." -ForegroundColor Yellow

$departamentosResponse = Invoke-ApiRequest -Method GET -Uri $departamentosUrl -Headers $headers

if ($departamentosResponse -and $departamentosResponse.status -eq "success") {
    $departamentos = $departamentosResponse.data.departamentos
    Write-Host "✅ Departamentos encontrados: $($departamentos.Count)" -ForegroundColor Green
    
    if ($departamentos.Count -gt 0) {
        Write-Host "   Primeros 3 departamentos:" -ForegroundColor Gray
        $departamentos | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.nombre) (Código DANE: $($_.codigo_dane), Región: $($_.region))" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Error listando departamentos" -ForegroundColor Red
}

Write-Host ""

# 3. Buscar departamento por código DANE
Write-Host "🔍 3. Buscando departamento por código DANE (05 - Antioquia)..." -ForegroundColor Yellow

$antioquiaResponse = Invoke-ApiRequest -Method GET -Uri "$departamentosUrl/codigo-dane/05" -Headers $headers

if ($antioquiaResponse -and $antioquiaResponse.status -eq "success") {
    $antioquia = $antioquiaResponse.data
    Write-Host "✅ Departamento encontrado: $($antioquia.nombre)" -ForegroundColor Green
    Write-Host "   Región: $($antioquia.region)" -ForegroundColor Gray
    Write-Host "   Municipios: $($antioquia.municipios.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Error buscando departamento por código DANE" -ForegroundColor Red
}

Write-Host ""

# 4. Listar municipios
Write-Host "🏙️ 4. Listando municipios..." -ForegroundColor Yellow

$municipiosResponse = Invoke-ApiRequest -Method GET -Uri $municipiosUrl -Headers $headers

if ($municipiosResponse -and $municipiosResponse.status -eq "success") {
    $municipios = $municipiosResponse.data.municipios
    Write-Host "✅ Municipios encontrados: $($municipios.Count)" -ForegroundColor Green
    
    if ($municipios.Count -gt 0) {
        Write-Host "   Primeros 3 municipios:" -ForegroundColor Gray
        $municipios | Select-Object -First 3 | ForEach-Object {
            $deptoNombre = if ($_.departamento) { $_.departamento.nombre } else { "Sin departamento" }
            Write-Host "   - $($_.nombre) (Código DANE: $($_.codigo_dane), Departamento: $deptoNombre)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Error listando municipios" -ForegroundColor Red
}

Write-Host ""

# 5. Buscar municipios por departamento (Antioquia)
if ($antioquiaResponse -and $antioquiaResponse.data.id_departamento) {
    $antioquiaId = $antioquiaResponse.data.id_departamento
    Write-Host "🔍 5. Buscando municipios de Antioquia (ID: $antioquiaId)..." -ForegroundColor Yellow
    
    $municipiosAntioquiaResponse = Invoke-ApiRequest -Method GET -Uri "$municipiosUrl/departamento/$antioquiaId" -Headers $headers
    
    if ($municipiosAntioquiaResponse -and $municipiosAntioquiaResponse.status -eq "success") {
        $municipiosAntioquia = $municipiosAntioquiaResponse.data.municipios
        Write-Host "✅ Municipios de Antioquia encontrados: $($municipiosAntioquia.Count)" -ForegroundColor Green
        
        if ($municipiosAntioquia.Count -gt 0) {
            Write-Host "   Algunos municipios:" -ForegroundColor Gray
            $municipiosAntioquia | Select-Object -First 5 | ForEach-Object {
                Write-Host "   - $($_.nombre) (Código DANE: $($_.codigo_dane))" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ Error buscando municipios de Antioquia" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ 5. No se pudo obtener el ID de Antioquia para buscar municipios" -ForegroundColor Yellow
}

Write-Host ""

# 6. Crear un nuevo municipio (ejemplo)
Write-Host "➕ 6. Creando nuevo municipio..." -ForegroundColor Yellow

if ($antioquiaResponse -and $antioquiaResponse.data.id_departamento) {
    $antioquiaId = $antioquiaResponse.data.id_departamento
    
    $nuevoMunicipio = @{
        nombre = "Municipio de Prueba"
        codigo_dane = "05999"
        id_departamento = $antioquiaId
    } | ConvertTo-Json
    
    $crearMunicipioResponse = Invoke-ApiRequest -Method POST -Uri $municipiosUrl -Headers $headers -Body $nuevoMunicipio
    
    if ($crearMunicipioResponse -and $crearMunicipioResponse.status -eq "success") {
        $municipioCreado = $crearMunicipioResponse.data
        Write-Host "✅ Municipio creado exitosamente: $($municipioCreado.nombre)" -ForegroundColor Green
        Write-Host "   ID: $($municipioCreado.id_municipio)" -ForegroundColor Gray
        
        # 7. Actualizar el municipio creado
        Write-Host ""
        Write-Host "✏️ 7. Actualizando municipio creado..." -ForegroundColor Yellow
        
        $actualizarMunicipio = @{
            nombre = "Municipio de Prueba Actualizado"
            codigo_dane = "05999"
            id_departamento = $antioquiaId
        } | ConvertTo-Json
        
        $actualizarResponse = Invoke-ApiRequest -Method PUT -Uri "$municipiosUrl/$($municipioCreado.id_municipio)" -Headers $headers -Body $actualizarMunicipio
        
        if ($actualizarResponse -and $actualizarResponse.status -eq "success") {
            Write-Host "✅ Municipio actualizado exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error actualizando municipio" -ForegroundColor Red
        }
        
        # 8. Eliminar el municipio creado
        Write-Host ""
        Write-Host "🗑️ 8. Eliminando municipio de prueba..." -ForegroundColor Yellow
        
        $eliminarResponse = Invoke-ApiRequest -Method DELETE -Uri "$municipiosUrl/$($municipioCreado.id_municipio)" -Headers $headers
        
        if ($eliminarResponse -and $eliminarResponse.status -eq "success") {
            Write-Host "✅ Municipio eliminado exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error eliminando municipio" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Error creando municipio" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ 6. No se pudo crear municipio: Antioquia no encontrado" -ForegroundColor Yellow
}

Write-Host ""

# 9. Búsqueda por código DANE pattern
Write-Host "🔍 9. Buscando municipios con código DANE que empiece por '05'..." -ForegroundColor Yellow

$busquedaResponse = Invoke-ApiRequest -Method GET -Uri "$municipiosUrl/search/codigo-dane/05" -Headers $headers

if ($busquedaResponse -and $busquedaResponse.status -eq "success") {
    $municipiosEncontrados = $busquedaResponse.data.municipios
    Write-Host "✅ Municipios encontrados con código '05': $($municipiosEncontrados.Count)" -ForegroundColor Green
    
    if ($municipiosEncontrados.Count -gt 0) {
        Write-Host "   Algunos resultados:" -ForegroundColor Gray
        $municipiosEncontrados | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.nombre) (Código DANE: $($_.codigo_dane))" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Error en búsqueda por patrón de código DANE" -ForegroundColor Red
}

Write-Host ""

# 10. Listar departamentos por región
Write-Host "🌎 10. Listando departamentos de la región Andina..." -ForegroundColor Yellow

$regionResponse = Invoke-ApiRequest -Method GET -Uri "$departamentosUrl/region/Andina" -Headers $headers

if ($regionResponse -and $regionResponse.status -eq "success") {
    $departamentosAndinos = $regionResponse.data.departamentos
    Write-Host "✅ Departamentos de la región Andina: $($departamentosAndinos.Count)" -ForegroundColor Green
    
    if ($departamentosAndinos.Count -gt 0) {
        Write-Host "   Departamentos:" -ForegroundColor Gray
        $departamentosAndinos | ForEach-Object {
            Write-Host "   - $($_.nombre) (Código DANE: $($_.codigo_dane))" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Error listando departamentos por región" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Pruebas del CRUD de Municipios y Departamentos completadas!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Para más información, revisa la documentación de Swagger en: http://localhost:3000/api-docs" -ForegroundColor Cyan
