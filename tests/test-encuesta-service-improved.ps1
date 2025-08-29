#!/usr/bin/env pwsh

# Test Suite para el Servicio de Encuestas Mejorado
# Fecha: 2025-08-28
# Propósito: Validar la nueva lógica de detección de errores de formulación

Write-Host "🧪 INICIANDO TESTS DEL SERVICIO DE ENCUESTAS MEJORADO" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

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
    
    Write-Host "`n📋 TEST 1: GET /api/encuesta (Listar encuestas)" -ForegroundColor Cyan
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$encuestaUrl?page=1&limit=5" -Method GET -Headers $headers
        Write-Host "✅ GET encuestas exitoso" -ForegroundColor Green
        Write-Host "   📊 Total encuestas: $($response.total)" -ForegroundColor White
        Write-Host "   📄 Encuestas obtenidas: $($response.datos.Count)" -ForegroundColor White
        return $true
    } catch {
        Write-Host "❌ Error en GET encuestas: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para crear encuesta de prueba - familia nueva
function Test-CreateNewFamily {
    param($token)
    
    Write-Host "`n➕ TEST 2: POST /api/encuesta (Crear familia nueva)" -ForegroundColor Cyan
    
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    
    $newFamilyData = @{
        informacionGeneral = @{
            apellido_familiar = "Test Familia $timestamp"
            telefono = "300${timestamp.ToString().Substring(7)}"
            direccion = "Calle Test #$timestamp-01"
            email = "test$timestamp@test.com"
            id_municipio = 1
        }
        familyMembers = @(
            @{
                nombres = "Juan Carlos"
                apellidos = "Test $timestamp"
                numeroIdentificacion = "1000${timestamp.ToString().Substring(7)}"
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
            observaciones_generales = "Encuesta de prueba - familia nueva"
            comunionEnCasa = $false
        }
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $newFamilyData -Headers $headers
        Write-Host "✅ Creación de familia nueva exitosa" -ForegroundColor Green
        Write-Host "   🆔 ID Familia: $($response.data.familia.id_familia)" -ForegroundColor White
        Write-Host "   📝 Código: $($response.data.familia.codigo_familia)" -ForegroundColor White
        return @{
            success = $true
            familiaId = $response.data.familia.id_familia
            apellido = $response.data.familia.apellido_familiar
            telefono = $response.data.familia.telefono
            direccion = $response.data.familia.direccion_familia
        }
    } catch {
        Write-Host "❌ Error creando familia nueva: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
            Write-Host "   📄 Detalles: $errorContent" -ForegroundColor Yellow
        }
        return @{ success = $false }
    }
}

# Función para probar familia duplicada (mismo apellido, teléfono, dirección)
function Test-DuplicateFamily {
    param($token, $familiaInfo)
    
    Write-Host "`n🔄 TEST 3: POST /api/encuesta (Familia duplicada - mismos datos)" -ForegroundColor Cyan
    
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
                numeroIdentificacion = "2000123456789"  # Diferente identificación
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
            observaciones_generales = "Test familia duplicada con miembro diferente"
            comunionEnCasa = $false
        }
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $duplicateData -Headers $headers
        Write-Host "❌ ERROR: Se permitió crear familia duplicada (esto no debería pasar)" -ForegroundColor Red
        return $false
    } catch {
        Write-Host "✅ Familia duplicada detectada correctamente" -ForegroundColor Green
        
        if ($_.Exception.Response.StatusCode -eq 409) {
            try {
                $errorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result | ConvertFrom-Json
                Write-Host "   📋 Mensaje: $($errorContent.message)" -ForegroundColor Yellow
                Write-Host "   🚨 Error de formulación detectado: $($errorContent.data.posible_error_formulacion)" -ForegroundColor Yellow
                
                if ($errorContent.data.miembros_existentes) {
                    Write-Host "   👥 Miembros existentes:" -ForegroundColor White
                    $errorContent.data.miembros_existentes | ForEach-Object {
                        Write-Host "      - $($_.nombre) (ID: $($_.identificacion))" -ForegroundColor Gray
                    }
                }
                
                if ($errorContent.data.miembros_en_nueva_encuesta) {
                    Write-Host "   👤 Miembros en nueva encuesta:" -ForegroundColor White
                    $errorContent.data.miembros_en_nueva_encuesta | ForEach-Object {
                        Write-Host "      - $($_.nombre) (ID: $($_.identificacion))" -ForegroundColor Gray
                    }
                }
                
                Write-Host "   💡 Instrucciones:" -ForegroundColor Cyan
                $errorContent.data.instrucciones | ForEach-Object {
                    Write-Host "      • $_" -ForegroundColor Gray
                }
                
                return $true
            } catch {
                Write-Host "   ⚠️ No se pudo parsear el error detallado" -ForegroundColor Yellow
                return $true
            }
        } else {
            Write-Host "   ⚠️ Error diferente al esperado: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    }
}

# Función para probar familia con datos diferentes (debería funcionar)
function Test-DifferentFamily {
    param($token)
    
    Write-Host "`n✨ TEST 4: POST /api/encuesta (Familia diferente - debería funcionar)" -ForegroundColor Cyan
    
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    
    $differentFamilyData = @{
        informacionGeneral = @{
            apellido_familiar = "Familia Diferente $timestamp"
            telefono = "301${timestamp.ToString().Substring(7)}"
            direccion = "Avenida Diferente #$timestamp-99"
            email = "diferente$timestamp@test.com"
            id_municipio = 1
        }
        familyMembers = @(
            @{
                nombres = "Ana Patricia"
                apellidos = "Diferente $timestamp"
                numeroIdentificacion = "3000${timestamp.ToString().Substring(7)}"
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
            observaciones_generales = "Encuesta de prueba - familia completamente diferente"
            comunionEnCasa = $true
        }
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $differentFamilyData -Headers $headers
        Write-Host "✅ Creación de familia diferente exitosa" -ForegroundColor Green
        Write-Host "   🆔 ID Familia: $($response.data.familia.id_familia)" -ForegroundColor White
        Write-Host "   📝 Código: $($response.data.familia.codigo_familia)" -ForegroundColor White
        return $true
    } catch {
        Write-Host "❌ Error creando familia diferente: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
            Write-Host "   📄 Detalles: $errorContent" -ForegroundColor Yellow
        }
        return $false
    }
}

# Función para probar validación de campos requeridos
function Test-ValidationErrors {
    param($token)
    
    Write-Host "`n🚫 TEST 5: POST /api/encuesta (Validación de campos requeridos)" -ForegroundColor Cyan
    
    $invalidData = @{
        informacionGeneral = @{
            # Falta apellido_familiar
            telefono = "3001234567"
            direccion = "Calle Test"
            id_municipio = 1
        }
        # Faltan otros campos requeridos
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $invalidData -Headers $headers
        Write-Host "❌ ERROR: Se permitió crear encuesta con datos inválidos" -ForegroundColor Red
        return $false
    } catch {
        Write-Host "✅ Validación de campos requeridos funcionando" -ForegroundColor Green
        Write-Host "   📄 Error esperado: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
        return $true
    }
}

# EJECUTAR TODOS LOS TESTS
Write-Host "`n🚀 Ejecutando suite completa de tests..." -ForegroundColor Green

# 1. Obtener token
$token = Get-AuthToken
if (-not $token) {
    Write-Host "❌ No se pudo obtener token. Terminando tests." -ForegroundColor Red
    exit 1
}

# 2. Test GET encuestas
$getTest = Test-GetEncuestas -token $token

# 3. Test crear familia nueva
$newFamilyResult = Test-CreateNewFamily -token $token

# 4. Test familia duplicada (solo si la familia nueva se creó exitosamente)
$duplicateTest = $false
if ($newFamilyResult.success) {
    $duplicateTest = Test-DuplicateFamily -token $token -familiaInfo $newFamilyResult
}

# 5. Test familia diferente
$differentTest = Test-DifferentFamily -token $token

# 6. Test validaciones
$validationTest = Test-ValidationErrors -token $token

# RESUMEN DE RESULTADOS
Write-Host "`n📊 RESUMEN DE RESULTADOS" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. GET Encuestas:           $(if($getTest) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if($getTest) { 'Green' } else { 'Red' })
Write-Host "2. Crear Familia Nueva:     $(if($newFamilyResult.success) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if($newFamilyResult.success) { 'Green' } else { 'Red' })
Write-Host "3. Detectar Familia Duplicada: $(if($duplicateTest) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if($duplicateTest) { 'Green' } else { 'Red' })
Write-Host "4. Crear Familia Diferente: $(if($differentTest) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if($differentTest) { 'Green' } else { 'Red' })
Write-Host "5. Validación de Campos:    $(if($validationTest) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if($validationTest) { 'Green' } else { 'Red' })

$totalTests = 5
$passedTests = @($getTest, $newFamilyResult.success, $duplicateTest, $differentTest, $validationTest) | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count

Write-Host "`n🎯 RESULTADO FINAL: $passedTests/$totalTests tests pasaron ($(($passedTests/$totalTests*100).ToString('F0'))%)" -ForegroundColor $(if($passedTests -eq $totalTests) { 'Green' } else { 'Yellow' })

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ¡Todos los tests pasaron! El servicio funciona correctamente." -ForegroundColor Green
} else {
    Write-Host "⚠️ Algunos tests fallaron. Revisar implementación." -ForegroundColor Yellow
}

Write-Host "`n✅ Tests completados." -ForegroundColor Cyan
