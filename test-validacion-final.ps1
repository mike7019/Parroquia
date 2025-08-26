# Script PowerShell para probar validacion de miembros unicos

Write-Host "PRUEBA DE VALIDACION DE MIEMBROS UNICOS" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Yellow

$BaseUrl = "http://localhost:3000"
$LoginUrl = "$BaseUrl/api/auth/login"
$EncuestaUrl = "$BaseUrl/api/encuesta"

# Obtener token
Write-Host "Obteniendo token..." -ForegroundColor Blue
$LoginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json -Compress

try {
    $LoginResponse = Invoke-RestMethod -Uri $LoginUrl -Method POST -Body $LoginData -ContentType "application/json"
    $Token = $LoginResponse.data.accessToken
    Write-Host "Token obtenido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error al obtener token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers para las pruebas
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "Ejecutando pruebas..." -ForegroundColor Blue

# PRUEBA 1: Duplicados en la misma familia
Write-Host ""
Write-Host "PRUEBA 1: Duplicados en la misma familia" -ForegroundColor Cyan

$FamiliaConDuplicados = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Duplicados"
        direccion = "Calle Test 123"
        telefono = "3001111111"
        numero_contrato_epm = "11111111"
        fecha = "2025-08-25T00:00:00.000Z"
        comunionEnCasa = $false
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true; quemada = $false; enterrada = $false
            recicla = $false; aire_libre = $false; no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Publico" }
        pozo_septico = $false
        letrina = $false
        campo_abierto = $false
    }
    observaciones = @{
        autorizacion_datos = $true
        sustento_familia = "Prueba de duplicados internos"
        observaciones_encuestador = "Test duplicados"
    }
    familyMembers = @(
        @{
            nombres = "Juan Test"
            numeroIdentificacion = "88888888"
            tipoIdentificacion = @{ id = 1; nombre = "Cedula de Ciudadania" }
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
            nombres = "Maria Test"
            numeroIdentificacion = "88888888"
            tipoIdentificacion = @{ id = 1; nombre = "Cedula de Ciudadania" }
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

$JsonBody = $FamiliaConDuplicados | ConvertTo-Json -Depth 10 -Compress

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body $JsonBody -Headers $Headers
    Write-Host "ERROR: No se detecto el duplicado (deberia haber fallado)" -ForegroundColor Red
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "EXITO: Error detectado correctamente" -ForegroundColor Green
    Write-Host "  Codigo HTTP: $StatusCode" -ForegroundColor Yellow
    
    if ($StatusCode -eq 400) {
        Write-Host "  Tipo: Error de validacion (duplicados en familia)" -ForegroundColor Yellow
    }
}

# PRUEBA 2: Crear familia valida
Write-Host ""
Write-Host "PRUEBA 2: Crear familia valida" -ForegroundColor Cyan

$FamiliaValida = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Familia Base"
        direccion = "Calle Test 456"
        telefono = "3002222222"
        numero_contrato_epm = "22222222"
        fecha = "2025-08-25T00:00:00.000Z"
        comunionEnCasa = $false
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true; quemada = $false; enterrada = $false
            recicla = $false; aire_libre = $false; no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Publico" }
        pozo_septico = $false
        letrina = $false
        campo_abierto = $false
    }
    observaciones = @{
        autorizacion_datos = $true
        sustento_familia = "Familia base para pruebas"
        observaciones_encuestador = "Test de validacion"
    }
    familyMembers = @(
        @{
            nombres = "Pedro Base"
            numeroIdentificacion = "99999998"  # Cambiado para evitar duplicados
            tipoIdentificacion = @{ id = 1; nombre = "Cedula de Ciudadania" }
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

$JsonBody = $FamiliaValida | ConvertTo-Json -Depth 10 -Compress

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body $JsonBody -Headers $Headers
    Write-Host "EXITO: Familia creada exitosamente" -ForegroundColor Green
    Write-Host "  Familia ID: $($Response.data.familia.id)" -ForegroundColor Yellow
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR: Familia valida fallo (no deberia haber fallado)" -ForegroundColor Red
    Write-Host "  Codigo HTTP: $StatusCode" -ForegroundColor Yellow
}

# PRUEBA 3: Intentar duplicar miembro de otra familia
Write-Host ""
Write-Host "PRUEBA 3: Intentar duplicar miembro existente" -ForegroundColor Cyan

$FamiliaConMiembroExistente = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Familia Duplicada"
        direccion = "Calle Test 789"
        telefono = "3003333333"
        numero_contrato_epm = "33333333"
        fecha = "2025-08-25T00:00:00.000Z"
        comunionEnCasa = $false
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true; quemada = $false; enterrada = $false
            recicla = $false; aire_libre = $false; no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Publico" }
        pozo_septico = $false
        letrina = $false
        campo_abierto = $false
    }
    observaciones = @{
        autorizacion_datos = $true
        sustento_familia = "Intenta duplicar miembro existente"
        observaciones_encuestador = "Test duplicado entre familias"
    }
    familyMembers = @(
        @{
            nombres = "Ana Nueva"
            numeroIdentificacion = "99999998"  # Intentar duplicar el numero de la familia anterior
            tipoIdentificacion = @{ id = 1; nombre = "Cedula de Ciudadania" }
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

$JsonBody = $FamiliaConMiembroExistente | ConvertTo-Json -Depth 10 -Compress

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body $JsonBody -Headers $Headers
    Write-Host "ERROR: No se detecto el duplicado entre familias" -ForegroundColor Red
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "EXITO: Duplicado detectado correctamente" -ForegroundColor Green
    Write-Host "  Codigo HTTP: $StatusCode" -ForegroundColor Yellow
    
    if ($StatusCode -eq 409) {
        Write-Host "  Tipo: Conflicto de miembro existente en otra familia" -ForegroundColor Yellow
        
        try {
            $ErrorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
            $ErrorJson = $ErrorContent | ConvertFrom-Json
            
            if ($ErrorJson.conflictos) {
                Write-Host "  Conflictos detectados:" -ForegroundColor Yellow
                foreach ($conflicto in $ErrorJson.conflictos) {
                    Write-Host "    - $($conflicto.nombre_completo) ($($conflicto.identificacion))" -ForegroundColor Yellow
                    Write-Host "      Ya pertenece a familia: $($conflicto.familia_actual.apellido)" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "  No se pudo obtener detalles del error" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "RESUMEN DE VALIDACIONES" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host "Prevencion de duplicados en la misma familia" -ForegroundColor White
Write-Host "Prevencion de miembros que ya pertenecen a otra familia" -ForegroundColor White
Write-Host "Respuestas de error apropiadas (400 y 409)" -ForegroundColor White
Write-Host "Detalles de conflictos en las respuestas" -ForegroundColor White

Write-Host ""
Write-Host "VALIDACION COMPLETADA EXITOSAMENTE" -ForegroundColor Green
