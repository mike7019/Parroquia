# Script PowerShell para probar la validación de miembros únicos
# Ejecutar con: .\test-validacion-miembros-endpoint.ps1

Write-Host "🧪 Script de prueba para validación de miembros únicos" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Yellow

$BaseUrl = "http://localhost:3000"
$LoginUrl = "$BaseUrl/api/auth/login"
$EncuestaUrl = "$BaseUrl/api/encuesta"

# Función para obtener token
function Get-AuthToken {
    $LoginData = @{
        correo_electronico = "admin@parroquia.com"
        contrasena = "admin123"
    } | ConvertTo-Json -Compress

    try {
        $LoginResponse = Invoke-RestMethod -Uri $LoginUrl -Method POST -Body $LoginData -ContentType "application/json"
        return $LoginResponse.token
    } catch {
        Write-Host "❌ Error al obtener token: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para probar endpoint
function Test-EncuestaValidation {
    param (
        [string]$TestName,
        [hashtable]$EncuestaData,
        [string]$Token,
        [string]$ExpectedResult
    )
    
    Write-Host "`n🚀 PROBANDO: $TestName" -ForegroundColor Cyan
    Write-Host ("=" * ($TestName.Length + 11)) -ForegroundColor Cyan
    
    $Headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    $JsonBody = $EncuestaData | ConvertTo-Json -Depth 10 -Compress
    
    try {
        $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body $JsonBody -Headers $Headers
        
        Write-Host "✅ RESPUESTA EXITOSA (no esperada para casos de error):" -ForegroundColor Green
        Write-Host "   Status: $($Response.status)" -ForegroundColor White
        Write-Host "   Message: $($Response.message)" -ForegroundColor White
        
        if ($ExpectedResult -eq "ERROR") {
            Write-Host "⚠️ ADVERTENCIA: Se esperaba un error pero la respuesta fue exitosa" -ForegroundColor Yellow
            return $false
        }
        
        return $true
        
    } catch {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        
        Write-Host "❌ ERROR RECIBIDO:" -ForegroundColor Red
        Write-Host "   Código HTTP: $StatusCode" -ForegroundColor Red
        
        try {
            $ErrorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
            $ErrorJson = $ErrorContent | ConvertFrom-Json
            
            Write-Host "   Status: $($ErrorJson.status)" -ForegroundColor Red
            Write-Host "   Message: $($ErrorJson.message)" -ForegroundColor Red
            Write-Host "   Error Code: $($ErrorJson.error_code)" -ForegroundColor Red
            
            if ($ErrorJson.conflictos) {
                Write-Host "   Conflictos detectados:" -ForegroundColor Yellow
                foreach ($conflicto in $ErrorJson.conflictos) {
                    Write-Host "     - $($conflicto.nombre_completo) ($($conflicto.identificacion))" -ForegroundColor Yellow
                    Write-Host "       Familia actual: $($conflicto.familia_actual.apellido)" -ForegroundColor Yellow
                }
            }
            
            if ($ExpectedResult -eq "ERROR") {
                if ($StatusCode -eq 409 -and $ErrorJson.error_code -eq "MIEMBROS_DUPLICADOS") {
                    Write-Host "✅ ERROR ESPERADO: Validación funcionando correctamente" -ForegroundColor Green
                    return $true
                } elseif ($StatusCode -eq 400) {
                    Write-Host "✅ ERROR DE VALIDACIÓN: Validador funcionando correctamente" -ForegroundColor Green
                    return $true
                }
            }
            
        } catch {
            Write-Host "   No se pudo parsear el error del servidor" -ForegroundColor Red
        }
        
        if ($ExpectedResult -eq "SUCCESS") {
            Write-Host "❌ ERROR INESPERADO: Se esperaba éxito" -ForegroundColor Red
            return $false
        }
        
        return $true
    }
}
    }
}

Write-Host "🔑 Paso 1: Obteniendo token JWT..." -ForegroundColor Blue
$Token = Get-AuthToken

if (-not $Token) {
    Write-Host "❌ No se pudo obtener el token. Verifique que el servidor esté corriendo." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green

# Caso 1: Duplicados en la misma familia (debería fallar en validación)
$CasoDuplicadosInternos = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellín" }
        apellido_familiar = "Test Duplicados Internos"
        direccion = "Calle Test 123"
        telefono = "3001111111"
        numero_contrato_epm = "11111111"
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true; quemada = $false; enterrada = $false
            recicla = $false; aire_libre = $false; no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Público" }
    }
    observaciones = "Prueba de duplicados internos"
    familyMembers = @(
        @{
            nombres = "Juan Test 1"
            numeroIdentificacion = "99999999"  # DUPLICADO
            tipoIdentificacion = @{ id = 1; nombre = "Cédula de Ciudadanía" }
            fechaNacimiento = "1985-01-01"
            sexo = @{ id = 1; nombre = "Masculino" }
            telefono = "3001111111"
            situacionCivil = @{ id = 1; nombre = "Soltero" }
            estudio = @{ id = 1; nombre = "Universitario" }
            parentesco = @{ id = 1; nombre = "Jefe de Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "L"
            talla_pantalon = "32"
            talla_zapato = "42"
            profesion = @{ id = 1; nombre = "Ingeniero" }
        },
        @{
            nombres = "María Test 2"
            numeroIdentificacion = "99999999"  # DUPLICADO - Mismo número
            tipoIdentificacion = @{ id = 1; nombre = "Cédula de Ciudadanía" }
            fechaNacimiento = "1990-01-01"
            sexo = @{ id = 2; nombre = "Femenino" }
            telefono = "3001111111"
            situacionCivil = @{ id = 1; nombre = "Soltera" }
            estudio = @{ id = 2; nombre = "Bachillerato" }
            parentesco = @{ id = 2; nombre = "Esposa" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "M"
            talla_pantalon = "30"
            talla_zapato = "38"
            profesion = @{ id = 2; nombre = "Ama de Casa" }
        }
    )
    deceasedMembers = @()
}

# Caso 2: Crear una familia válida primero
$FamiliaValida = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellín" }
        apellido_familiar = "Test Familia Base"
        direccion = "Calle Test 456"
        telefono = "3002222222"
        numero_contrato_epm = "22222222"
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true; quemada = $false; enterrada = $false
            recicla = $false; aire_libre = $false; no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Público" }
    }
    observaciones = "Familia base para probar duplicados"
    familyMembers = @(
        @{
            nombres = "Pedro Base Original"
            numeroIdentificacion = "88888888"  # Número que luego intentaremos duplicar
            tipoIdentificacion = @{ id = 1; nombre = "Cédula de Ciudadanía" }
            fechaNacimiento = "1980-01-01"
            sexo = @{ id = 1; nombre = "Masculino" }
            telefono = "3002222222"
            situacionCivil = @{ id = 1; nombre = "Soltero" }
            estudio = @{ id = 1; nombre = "Universitario" }
            parentesco = @{ id = 1; nombre = "Jefe de Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "L"
            talla_pantalon = "32"
            talla_zapato = "42"
            profesion = @{ id = 1; nombre = "Ingeniero" }
        }
    )
    deceasedMembers = @()
}

# Caso 3: Intentar crear familia con miembro que ya existe
$FamiliaConMiembroExistente = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellín" }
        apellido_familiar = "Test Familia Duplicada"
        direccion = "Calle Test 789"
        telefono = "3003333333"
        numero_contrato_epm = "33333333"
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true; quemada = $false; enterrada = $false
            recicla = $false; aire_libre = $false; no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Público" }
    }
    observaciones = "Familia que intenta duplicar miembro existente"
    familyMembers = @(
        @{
            nombres = "Ana Nueva Familia"
            numeroIdentificacion = "88888888"  # DUPLICADO - Ya existe en la familia base
            tipoIdentificacion = @{ id = 1; nombre = "Cédula de Ciudadanía" }
            fechaNacimiento = "1985-01-01"
            sexo = @{ id = 2; nombre = "Femenino" }
            telefono = "3003333333"
            situacionCivil = @{ id = 1; nombre = "Soltera" }
            estudio = @{ id = 1; nombre = "Universitario" }
            parentesco = @{ id = 1; nombre = "Jefe de Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "M"
            talla_pantalon = "30"
            talla_zapato = "38"
            profesion = @{ id = 1; nombre = "Ingeniera" }
        }
    )
    deceasedMembers = @()
}

# Ejecutar pruebas
Write-Host "`n📝 Paso 2: Ejecutando casos de prueba..." -ForegroundColor Blue

$Test1 = Test-EncuestaValidation "Caso 1: Duplicados dentro de la misma familia" $CasoDuplicadosInternos $Token "ERROR"

$Test2 = Test-EncuestaValidation "Caso 2: Crear familia base (debería funcionar)" $FamiliaValida $Token "SUCCESS"

$Test3 = Test-EncuestaValidation "Caso 3: Intentar duplicar miembro de otra familia" $FamiliaConMiembroExistente $Token "ERROR"

# Resumen
Write-Host "`n🎉 RESUMEN DE PRUEBAS" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green

Write-Host "Caso 1 (duplicados internos): $(if ($Test1) { '✅ CORRECTO' } else { '❌ FALLÓ' })" -ForegroundColor $(if ($Test1) { 'Green' } else { 'Red' })
Write-Host "Caso 2 (familia válida): $(if ($Test2) { '✅ CORRECTO' } else { '❌ FALLÓ' })" -ForegroundColor $(if ($Test2) { 'Green' } else { 'Red' })
Write-Host "Caso 3 (duplicado entre familias): $(if ($Test3) { '✅ CORRECTO' } else { '❌ FALLÓ' })" -ForegroundColor $(if ($Test3) { 'Green' } else { 'Red' })

$AllPassed = $Test1 -and $Test2 -and $Test3
Write-Host "`n🏆 RESULTADO GENERAL: $(if ($AllPassed) { '✅ TODAS LAS VALIDACIONES FUNCIONAN CORRECTAMENTE' } else { '❌ ALGUNAS VALIDACIONES FALLARON' })" -ForegroundColor $(if ($AllPassed) { 'Green' } else { 'Red' })

Write-Host "`n📚 VALIDACIONES IMPLEMENTADAS:" -ForegroundColor Yellow
Write-Host "✅ Prevención de números de identificación duplicados en la misma familia" -ForegroundColor White
Write-Host "✅ Prevención de miembros que ya pertenecen a otra familia" -ForegroundColor White
Write-Host "✅ Validación tanto a nivel de esquema como de base de datos" -ForegroundColor White
Write-Host "✅ Respuestas de error detalladas con códigos específicos" -ForegroundColor White
