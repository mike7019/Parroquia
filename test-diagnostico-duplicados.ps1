# Script para diagnosticar la validacion de duplicados entre familias

Write-Host "DIAGNOSTICO DE VALIDACION DE DUPLICADOS" -ForegroundColor Green
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

# Verificar si ya existe una persona con identificacion 77777777
Write-Host ""
Write-Host "VERIFICANDO BASE DE DATOS ANTES DE LA PRUEBA" -ForegroundColor Cyan

# Familia de prueba que intentara duplicar un miembro
Write-Host ""
Write-Host "CREANDO FAMILIA CON MIEMBRO POTENCIALMENTE DUPLICADO" -ForegroundColor Cyan

$FamiliaConMiembroExistente = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellin" }
        apellido_familiar = "Test Familia Duplicada Diagnostico"
        direccion = "Calle Test Diagnostico 999"
        telefono = "3009999999"
        numero_contrato_epm = "99999999"
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
        texto = "Familia que intenta duplicar miembro existente"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Ana Nueva Diagnostico"
            numeroIdentificacion = "77777777"  # Intentamos duplicar este numero
            tipoIdentificacion = @{ id = 1; nombre = "Cedula de Ciudadania" }
            fechaNacimiento = "1985-01-01"
            sexo = @{ id = 2; nombre = "Femenino" }
            telefono = "3009999999"
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
    Write-Host "Enviando peticion..." -ForegroundColor Blue
    $Response = Invoke-RestMethod -Uri $EncuestaUrl -Method POST -Body $JsonBody -Headers $Headers
    Write-Host "ERROR: La familia se creo exitosamente - NO se detecto el duplicado" -ForegroundColor Red
    Write-Host "Familia ID: $($Response.data.familia.id)" -ForegroundColor Yellow
    Write-Host "Status: $($Response.status)" -ForegroundColor Yellow
    Write-Host "Message: $($Response.message)" -ForegroundColor Yellow
    
} catch {
    $StatusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "RESPUESTA DE ERROR (esto es lo esperado):" -ForegroundColor Green
    Write-Host "  Codigo HTTP: $StatusCode" -ForegroundColor Yellow
    
    try {
        $ErrorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
        $ErrorJson = $ErrorContent | ConvertFrom-Json
        
        Write-Host "  Status: $($ErrorJson.status)" -ForegroundColor Yellow
        Write-Host "  Message: $($ErrorJson.message)" -ForegroundColor Yellow
        Write-Host "  Error Code: $($ErrorJson.error_code)" -ForegroundColor Yellow
        
        if ($ErrorJson.conflictos) {
            Write-Host "  Conflictos detectados:" -ForegroundColor Green
            foreach ($conflicto in $ErrorJson.conflictos) {
                Write-Host "    - $($conflicto.nombre_completo) ($($conflicto.identificacion))" -ForegroundColor Green
                Write-Host "      Ya pertenece a familia: $($conflicto.familia_actual.apellido)" -ForegroundColor Green
            }
        }
        
        if ($StatusCode -eq 409) {
            Write-Host "  EXITO: Error 409 - Validacion funcionando correctamente!" -ForegroundColor Green
        } elseif ($StatusCode -eq 400) {
            Write-Host "  EXITO: Error 400 - Validacion de esquema funcionando!" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  No se pudo parsear el contenido del error" -ForegroundColor Yellow
        Write-Host "  Error raw: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "DIAGNOSTICO COMPLETADO" -ForegroundColor Green
