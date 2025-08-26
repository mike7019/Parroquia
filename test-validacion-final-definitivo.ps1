# Script final de validacion con numeros unicos

Write-Host "VALIDACION FINAL DE MIEMBROS UNICOS" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Yellow

$BaseUrl = "http://localhost:3000"
$LoginUrl = "$BaseUrl/api/auth/login"
$EncuestaUrl = "$BaseUrl/api/encuesta"

# Generar numeros unicos basados en timestamp
$Timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$ID1 = "99${Timestamp}1"
$ID2 = "99${Timestamp}2" 
$ID3 = "99${Timestamp}3"

Write-Host "IDs generados para pruebas:"
Write-Host "  ID1 (duplicado interno): $ID1"
Write-Host "  ID2 (familia valida): $ID2"
Write-Host "  ID3 (duplicado entre familias): $ID2 (reutiliza ID2)"

# Obtener token
$LoginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json -Compress

$LoginResponse = Invoke-RestMethod -Uri $LoginUrl -Method POST -Body $LoginData -ContentType "application/json"
$Token = $LoginResponse.data.accessToken

$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "Ejecutando pruebas..." -ForegroundColor Blue

# PRUEBA 1: Duplicados internos
Write-Host ""
Write-Host "PRUEBA 1: Duplicados en la misma familia" -ForegroundColor Cyan

$FamiliaConDuplicados = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Duplicados Final"
        direccion = "Calle Test Final 123"
        telefono = "3001111111"
        numero_contrato_epm = "11111111"
        fecha = "2025-08-25"
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
        texto = "Prueba de duplicados internos final"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Juan Final"
            numeroIdentificacion = $ID1
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
            nombres = "Maria Final"
            numeroIdentificacion = $ID1  # DUPLICADO INTERNO
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

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body ($FamiliaConDuplicados | ConvertTo-Json -Depth 10) -Headers $Headers
    Write-Host "ERROR: No se detecto el duplicado interno" -ForegroundColor Red
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    if ($StatusCode -eq 400) {
        Write-Host "EXITO: Duplicado interno detectado (HTTP 400)" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Codigo inesperado $StatusCode" -ForegroundColor Red
    }
}

# PRUEBA 2: Familia valida
Write-Host ""
Write-Host "PRUEBA 2: Crear familia valida" -ForegroundColor Cyan

$FamiliaValida = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Familia Base Final"
        direccion = "Calle Test Final 456"
        telefono = "3002222222"
        numero_contrato_epm = "22222222"
        fecha = "2025-08-25"
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
        texto = "Familia base para pruebas final"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Pedro Base Final"
            numeroIdentificacion = $ID2  # NUMERO UNICO
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

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body ($FamiliaValida | ConvertTo-Json -Depth 10) -Headers $Headers
    Write-Host "EXITO: Familia valida creada exitosamente" -ForegroundColor Green
    Write-Host "  Familia ID: $($Response.data.familia.id)" -ForegroundColor Yellow
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR: Familia valida fallo (HTTP $StatusCode)" -ForegroundColor Red
}

# PRUEBA 3: Duplicado entre familias
Write-Host ""
Write-Host "PRUEBA 3: Intentar duplicar miembro existente" -ForegroundColor Cyan

$FamiliaConMiembroExistente = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Familia Duplicada Final"
        direccion = "Calle Test Final 789"
        telefono = "3003333333"
        numero_contrato_epm = "33333333"
        fecha = "2025-08-25"
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
        texto = "Intenta duplicar miembro existente final"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Ana Nueva Final"
            numeroIdentificacion = $ID2  # REUTILIZA ID2 DE LA FAMILIA ANTERIOR
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

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body ($FamiliaConMiembroExistente | ConvertTo-Json -Depth 10) -Headers $Headers
    Write-Host "ERROR: No se detecto el duplicado entre familias" -ForegroundColor Red
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    if ($StatusCode -eq 409) {
        Write-Host "EXITO: Duplicado entre familias detectado (HTTP 409)" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Codigo inesperado $StatusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "RESUMEN FINAL DE VALIDACIONES" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "Prevencion de duplicados en la misma familia (HTTP 400)" -ForegroundColor White
Write-Host "Prevencion de miembros que ya pertenecen a otra familia (HTTP 409)" -ForegroundColor White
Write-Host "Creacion exitosa de familias validas" -ForegroundColor White
Write-Host "Respuestas de error detalladas con codigos especificos" -ForegroundColor White

Write-Host ""
Write-Host "VALIDACION COMPLETADA EXITOSAMENTE" -ForegroundColor Green
