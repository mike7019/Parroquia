# Script simple para crear una familia valida y ver que pasa

Write-Host "PRUEBA SIMPLE DE CREACION DE FAMILIA" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Yellow

$BaseUrl = "http://localhost:3000"
$LoginUrl = "$BaseUrl/api/auth/login"
$EncuestaUrl = "$BaseUrl/api/encuesta"

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

# Familia simple y valida
$FamiliaSimple = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Simple 123"
        direccion = "Calle Simple 123"
        telefono = "3001234567"
        numero_contrato_epm = "12345678"
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
        texto = "Familia simple de prueba"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Juan Simple"
            numeroIdentificacion = "11111111"
            tipoIdentificacion = @{ id = 1; nombre = "Cedula de Ciudadania" }
            fechaNacimiento = "1980-01-01"
            sexo = @{ id = 1; nombre = "Masculino" }
            telefono = "3001234567"
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

Write-Host "Enviando familia simple..." -ForegroundColor Blue

$JsonBody = $FamiliaSimple | ConvertTo-Json -Depth 10
Write-Host "JSON enviado:" -ForegroundColor Gray
Write-Host $JsonBody -ForegroundColor DarkGray

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body $JsonBody -Headers $Headers
    Write-Host "EXITO: Familia creada" -ForegroundColor Green
    Write-Host "  ID: $($Response.data.familia.id)" -ForegroundColor Yellow
    Write-Host "  Status: $($Response.status)" -ForegroundColor Yellow
    Write-Host "  Message: $($Response.message)" -ForegroundColor Yellow
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR: $StatusCode" -ForegroundColor Red
    
    if ($_.Exception.Response.Content) {
        $ErrorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Contenido del error:" -ForegroundColor Red
        Write-Host $ErrorContent -ForegroundColor Red
    } else {
        Write-Host "Sin contenido de error" -ForegroundColor Red
    }
}
