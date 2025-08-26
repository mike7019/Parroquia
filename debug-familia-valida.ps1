# Script para depurar la familia valida que esta fallando
Write-Host "DEPURACION DE FAMILIA VALIDA" -ForegroundColor Yellow

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

# Familia que deberia ser valida
$FamiliaValida = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Familia Debug"
        direccion = "Calle Debug 123"
        telefono = "3001234567"
        numero_contrato_epm = "12345678"
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
    }
    observaciones = "Familia para debug"
    familyMembers = @(
        @{
            nombres = "Pedro Debug"
            numeroIdentificacion = "99999999"
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

$JsonBody = $FamiliaValida | ConvertTo-Json -Depth 10 -Compress

Write-Host "JSON que se enviara:" -ForegroundColor Blue
Write-Host $JsonBody -ForegroundColor Gray

Write-Host "`nEnviando solicitud..." -ForegroundColor Blue

try {
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body $JsonBody -Headers $Headers
    Write-Host "EXITO: Familia creada" -ForegroundColor Green
    Write-Host ($Response | ConvertTo-Json -Depth 5) -ForegroundColor White
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR DETECTADO:" -ForegroundColor Red
    Write-Host "Codigo HTTP: $StatusCode" -ForegroundColor Red
    
    try {
        $ErrorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Contenido del error:" -ForegroundColor Yellow
        Write-Host $ErrorContent -ForegroundColor White
        
        $ErrorJson = $ErrorContent | ConvertFrom-Json
        Write-Host "`nError parseado:" -ForegroundColor Yellow
        Write-Host ($ErrorJson | ConvertTo-Json -Depth 5) -ForegroundColor White
        
    } catch {
        Write-Host "No se pudo parsear el error" -ForegroundColor Red
    }
}
