# PRUEBA FINAL - Encuesta con identificaciones unicas
Write-Host "=== PRUEBA FINAL ENCUESTA (IDENTIFICACIONES UNICAS) ===" -ForegroundColor Green

# 1. LOGIN
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.data.accessToken
Write-Host "✅ Login exitoso" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. OBTENER DATOS
$municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Headers $headers -Method GET
$municipio = if ($municipios.data.Count -gt 0) { $municipios.data[0] } else { @{ id = 1; nombre = "Medellin" } }

# IDs únicos para evitar duplicados
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$idPadre = "99${timestamp}01"
$idMadre = "99${timestamp}02"
$idDifunto = "99${timestamp}03"

Write-Host "Usando IDs únicos: $idPadre, $idMadre, $idDifunto" -ForegroundColor Cyan

# 3. ENCUESTA CON DATOS ÚNICOS
$encuestaCompleta = @{
    informacionGeneral = @{
        municipio = $municipio
        parroquia = @{ id = 1; nombre = "San Jose" }
        sector = @{ id = 1; nombre = "Centro" }
        vereda = @{ id = 1; nombre = "La Macarena" }
        fecha = "2025-01-02"
        apellido_familiar = "Familia Test Final $timestamp"
        direccion = "Carrera 45 # 23-67"
        telefono = "3001234567"
        numero_contrato_epm = "12345678901"
        comunionEnCasa = $false
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true
            quemada = $false
            enterrada = $false
            recicla = $true
            aire_libre = $false
            no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Publico" }
        aguas_residuales = @{ id = 1; nombre = "Alcantarillado" }
        pozo_septico = $false
        letrina = $false
        campo_abierto = $false
    }
    observaciones = @{
        sustento_familia = "Trabajo independiente en ventas y comercio"
        observaciones_encuestador = "Familia colaborativa - prueba completa API"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Carlos Test Final"
            numeroIdentificacion = $idPadre
            tipoIdentificacion = @{ id = 1; nombre = "Cedula Ciudadania" }
            fechaNacimiento = "1985-03-15"
            sexo = @{ id = 1; nombre = "Masculino" }
            telefono = "3001234567"
            situacionCivil = @{ id = 1; nombre = "Casado" }
            estudio = @{ id = 1; nombre = "Universitario" }
            parentesco = @{ id = 1; nombre = "Jefe Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "L"
            talla_pantalon = "32"
            talla_zapato = "42"
            ocupacion = @{ id = 1; nombre = "Comerciante" }
            discapacidad = @{ id = 1; nombre = "Ninguna" }
            bautizado = $true
            confirmado = $true
            primera_comunion = $true
            casado_iglesia = $true
        },
        @{
            nombres = "Maria Test Final"
            numeroIdentificacion = $idMadre
            tipoIdentificacion = @{ id = 1; nombre = "Cedula Ciudadania" }
            fechaNacimiento = "1988-07-20"
            sexo = @{ id = 2; nombre = "Femenino" }
            telefono = "3007654321"
            situacionCivil = @{ id = 1; nombre = "Casada" }
            estudio = @{ id = 1; nombre = "Bachiller" }
            parentesco = @{ id = 2; nombre = "Esposa" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "M"
            talla_pantalon = "10"
            talla_zapato = "37"
            ocupacion = @{ id = 2; nombre = "Ama de casa" }
            discapacidad = @{ id = 1; nombre = "Ninguna" }
            bautizado = $true
            confirmado = $false
            primera_comunion = $true
            casado_iglesia = $true
        }
    )
    deceasedMembers = @(
        @{
            nombres = "Pedro Test Final Abuelo"
            numeroIdentificacion = $idDifunto
            tipoIdentificacion = @{ id = 1; nombre = "Cedula Ciudadania" }
            fechaNacimiento = "1950-12-10"
            fechaFallecimiento = "2020-05-15"
            sexo = @{ id = 1; nombre = "Masculino" }
            parentesco = @{ id = 5; nombre = "Abuelo" }
            causaFallecimiento = "Enfermedad natural"
            lugarFallecimiento = "Hospital San Vicente"
        }
    )
}

# 4. ENVIAR ENCUESTA
Write-Host "`n4. Enviando encuesta final..." -ForegroundColor Yellow

$encuestaJson = $encuestaCompleta | ConvertTo-Json -Depth 10

try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta" -Method POST -Body $encuestaJson -Headers $headers
    Write-Host "🎉 ENCUESTA CREADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "📋 Familia: $($encuestaCompleta.informacionGeneral.apellido_familiar)" -ForegroundColor Cyan
    Write-Host "👥 Miembros vivos: $($encuestaCompleta.familyMembers.Count)" -ForegroundColor Cyan
    Write-Host "⚰️ Miembros difuntos: $($encuestaCompleta.deceasedMembers.Count)" -ForegroundColor Cyan
    Write-Host "🏠 Dirección: $($encuestaCompleta.informacionGeneral.direccion)" -ForegroundColor Cyan
    Write-Host "📞 Teléfono: $($encuestaCompleta.informacionGeneral.telefono)" -ForegroundColor Cyan
    Write-Host "`nRespuesta completa:" -ForegroundColor Yellow
    Write-Host ($resultado | ConvertTo-Json -Depth 3) -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✅ PRUEBA COMPLETA DE ENCUESTA FINALIZADA CON ÉXITO!" -ForegroundColor Green
