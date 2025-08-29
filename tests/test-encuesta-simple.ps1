#!/usr/bin/env pwsh

# Test Suite para el Servicio de Encuestas Mejorado
Write-Host "🧪 INICIANDO TESTS DEL SERVICIO DE ENCUESTAS MEJORADO" -ForegroundColor Cyan

# Configuración
$baseUrl = "http://206.62.139.100:3000/api"
$loginUrl = "$baseUrl/auth/login"
$encuestaUrl = "$baseUrl/encuesta"

# Función para hacer login y obtener token
function Get-AuthToken {
    Write-Host "🔐 Obteniendo token de autenticación..." -ForegroundColor Yellow
    
    $loginData = @{
        email = "admin@parroquia.com"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -ContentType "application/json"
        Write-Host "✅ Login exitoso" -ForegroundColor Green
        return $response.data.accessToken
    } catch {
        Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para probar GET encuestas
function Test-GetEncuestas {
    param($token)
    
    Write-Host "`n📋 TEST 1: GET /api/encuesta" -ForegroundColor Cyan
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$encuestaUrl?page=1&limit=5" -Method GET -Headers $headers
        Write-Host "✅ GET encuestas exitoso" -ForegroundColor Green
        Write-Host "   📊 Total: $($response.total)" -ForegroundColor White
        return $true
    } catch {
        Write-Host "❌ Error en GET: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para crear familia nueva
function Test-CreateNewFamily {
    param($token)
    
    Write-Host "`n➕ TEST 2: Crear familia nueva" -ForegroundColor Cyan
    
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    
    $newFamilyData = @{
        informacionGeneral = @{
            apellido_familiar = "Test Familia $timestamp"
            telefono = "300$($timestamp.ToString().Substring(7))"
            direccion = "Calle Test #$timestamp-01"
            email = "test$timestamp@test.com"
            id_municipio = 1
        }
        familyMembers = @(
            @{
                nombres = "Juan Carlos"
                apellidos = "Test $timestamp"
                numeroIdentificacion = "1000$($timestamp.ToString().Substring(7))"
                fechaNacimiento = "1990-01-01"
                tipoIdentificacion = "CC"
                sexo = "M"
                estadoCivil = "Soltero"
                nivelEducativo = "Universitario"
                ocupacion = "Ingeniero"
                esTutorResponsable = $true
            }
        )
        vivienda = @{
            tipo_vivienda = "Casa"
            material_paredes = "Ladrillo"
            material_pisos = "Cerámica"
            num_habitaciones = 3
        }
        servicios_agua = @{
            acueducto = $true
            alcantarillado = $true
            pozo_septico = $false
        }
        observaciones = @{
            observaciones_generales = "Encuesta de prueba"
            comunionEnCasa = $false
        }
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $newFamilyData -Headers $headers
        Write-Host "✅ Familia nueva creada" -ForegroundColor Green
        Write-Host "   🆔 ID: $($response.data.familia.id_familia)" -ForegroundColor White
        
        return @{
            success = $true
            familiaId = $response.data.familia.id_familia
            apellido = $response.data.familia.apellido_familiar
            telefono = $response.data.familia.telefono
            direccion = $response.data.familia.direccion_familia
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ success = $false }
    }
}

# Función para probar familia duplicada
function Test-DuplicateFamily {
    param($token, $familiaInfo)
    
    Write-Host "`n🔄 TEST 3: Familia duplicada (detección de error)" -ForegroundColor Cyan
    
    $duplicateData = @{
        informacionGeneral = @{
            apellido_familiar = $familiaInfo.apellido
            telefono = $familiaInfo.telefono
            direccion = $familiaInfo.direccion
            email = "duplicate@test.com"
            id_municipio = 1
        }
        familyMembers = @(
            @{
                nombres = "Maria Elena"
                apellidos = $familiaInfo.apellido
                numeroIdentificacion = "2000123456789"
                fechaNacimiento = "1985-06-15"
                tipoIdentificacion = "CC"
                sexo = "F"
                estadoCivil = "Casada"
                nivelEducativo = "Secundaria"
                ocupacion = "Ama de casa"
                esTutorResponsable = $true
            }
        )
        vivienda = @{
            tipo_vivienda = "Casa"
            material_paredes = "Ladrillo"
            material_pisos = "Cerámica"
            num_habitaciones = 4
        }
        servicios_agua = @{
            acueducto = $true
            alcantarillado = $true
            pozo_septico = $false
        }
        observaciones = @{
            observaciones_generales = "Test familia duplicada"
            comunionEnCasa = $false
        }
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $duplicateData -Headers $headers
        Write-Host "❌ ERROR: Se permitió crear familia duplicada" -ForegroundColor Red
        return $false
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "✅ Familia duplicada detectada correctamente" -ForegroundColor Green
            
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
                
                Write-Host "   📋 Mensaje: $($errorContent.message)" -ForegroundColor Yellow
                Write-Host "   🚨 Error de formulación: $($errorContent.data.posible_error_formulacion)" -ForegroundColor Yellow
                
                return $true
            } catch {
                Write-Host "   ⚠️ Error parseando respuesta detallada" -ForegroundColor Yellow
                return $true
            }
        } else {
            Write-Host "❌ Error inesperado: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
}

# Función para probar familia diferente
function Test-DifferentFamily {
    param($token)
    
    Write-Host "`n✨ TEST 4: Familia diferente (debería funcionar)" -ForegroundColor Cyan
    
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    
    $differentData = @{
        informacionGeneral = @{
            apellido_familiar = "Familia Diferente $timestamp"
            telefono = "301$($timestamp.ToString().Substring(7))"
            direccion = "Avenida Diferente #$timestamp-99"
            email = "diferente$timestamp@test.com"
            id_municipio = 1
        }
        familyMembers = @(
            @{
                nombres = "Ana Patricia"
                apellidos = "Diferente $timestamp"
                numeroIdentificacion = "3000$($timestamp.ToString().Substring(7))"
                fechaNacimiento = "1988-03-22"
                tipoIdentificacion = "CC"
                sexo = "F"
                estadoCivil = "Soltera"
                nivelEducativo = "Técnico"
                ocupacion = "Enfermera"
                esTutorResponsable = $true
            }
        )
        vivienda = @{
            tipo_vivienda = "Apartamento"
            material_paredes = "Concreto"
            material_pisos = "Laminado"
            num_habitaciones = 2
        }
        servicios_agua = @{
            acueducto = $true
            alcantarillado = $true
            pozo_septico = $false
        }
        observaciones = @{
            observaciones_generales = "Familia completamente diferente"
            comunionEnCasa = $true
        }
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $differentData -Headers $headers
        Write-Host "✅ Familia diferente creada exitosamente" -ForegroundColor Green
        Write-Host "   🆔 ID: $($response.data.familia.id_familia)" -ForegroundColor White
        return $true
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# EJECUTAR TESTS
Write-Host "`n🚀 Ejecutando tests..." -ForegroundColor Green

# 1. Login
$token = Get-AuthToken
if (-not $token) {
    Write-Host "❌ No se pudo obtener token. Terminando." -ForegroundColor Red
    exit 1
}

# 2. GET encuestas
$getTest = Test-GetEncuestas -token $token

# 3. Crear familia nueva
$newFamilyResult = Test-CreateNewFamily -token $token

# 4. Test familia duplicada
$duplicateTest = $false
if ($newFamilyResult.success) {
    $duplicateTest = Test-DuplicateFamily -token $token -familiaInfo $newFamilyResult
}

# 5. Familia diferente
$differentTest = Test-DifferentFamily -token $token

# RESUMEN
Write-Host "`n📊 RESUMEN DE RESULTADOS" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$tests = @(
    @{ Name = "GET Encuestas"; Result = $getTest }
    @{ Name = "Crear Familia Nueva"; Result = $newFamilyResult.success }
    @{ Name = "Detectar Duplicada"; Result = $duplicateTest }
    @{ Name = "Familia Diferente"; Result = $differentTest }
)

$passed = 0
foreach ($test in $tests) {
    $status = if ($test.Result) { "✅ PASS"; $passed++ } else { "❌ FAIL" }
    $color = if ($test.Result) { "Green" } else { "Red" }
    Write-Host "$($test.Name): $status" -ForegroundColor $color
}

$total = $tests.Count
$percentage = [math]::Round(($passed / $total) * 100, 0)

Write-Host "`n🎯 RESULTADO: $passed/$total tests pasaron ($percentage%)" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "🎉 ¡Todos los tests pasaron!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Algunos tests fallaron." -ForegroundColor Yellow
}

Write-Host "`n✅ Tests completados." -ForegroundColor Cyan
