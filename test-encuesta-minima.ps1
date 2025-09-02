# PRUEBA FINAL - Encuesta minima funcional
Write-Host "=== PRUEBA FINAL ENCUESTA MINIMA ===" -ForegroundColor Green

# 1. LOGIN
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.data.accessToken
Write-Host "Login exitoso" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. OBTENER DATOS REALES
$municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Headers $headers -Method GET
$municipio = $municipios.data[0]
Write-Host "Municipio: $($municipio.nombre) (ID: $($municipio.id))" -ForegroundColor Cyan

$veredas = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/veredas" -Headers $headers -Method GET
$vereda = $veredas.data.data[0]
Write-Host "Vereda: $($vereda.nombre) (ID: $($vereda.id_vereda))" -ForegroundColor Cyan

# IDs únicos
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$idPadre = "99${timestamp}01"
$idMadre = "99${timestamp}02"

# 3. ENCUESTA MINIMA CON DATOS REALES
$encuestaMinima = @{
    informacionGeneral = @{
        municipio = $municipio
        # Sin parroquia ni sector ya que no existen en el catalogo
        vereda = @{ id = $vereda.id_vereda; nombre = $vereda.nombre }
        fecha = "2025-01-02"
        apellido_familiar = "Test Final $timestamp"
        direccion = "Calle 123"
        telefono = "3001234567"
        numero_contrato_epm = "123456789"
        comunionEnCasa = $false
    }
    vivienda = @{
        tipo_vivienda = @{ id = 1; nombre = "Casa" }
        disposicion_basuras = @{
            recolector = $true
            quemada = $false
            enterrada = $false
            recicla = $false
            aire_libre = $false
            no_aplica = $false
        }
    }
    servicios_agua = @{
        sistema_acueducto = @{ id = 1; nombre = "Acueducto" }
        aguas_residuales = @{ id = 1; nombre = "Alcantarillado" }
        pozo_septico = $false
        letrina = $false
        campo_abierto = $false
    }
    observaciones = @{
        sustento_familia = "Trabajo"
        observaciones_encuestador = "Prueba API"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Carlos Test $timestamp"
            numeroIdentificacion = $idPadre
            tipoIdentificacion = @{ id = 1; nombre = "CC" }
            fechaNacimiento = "1985-03-15"
            sexo = @{ id = 1; nombre = "Masculino" }
            telefono = "3001234567"
            situacionCivil = @{ id = 1; nombre = "Soltero" }
            estudio = @{ id = 1; nombre = "Primaria" }
            parentesco = @{ id = 1; nombre = "Jefe" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "L"
            talla_pantalon = "32"
            talla_zapato = "42"
            ocupacion = @{ id = 1; nombre = "Otro" }
            discapacidad = @{ id = 1; nombre = "Ninguna" }
            bautizado = $true
            confirmado = $false
            primera_comunion = $false
            casado_iglesia = $false
        }
    )
    deceasedMembers = @()
}

# 4. ENVIAR ENCUESTA
Write-Host "`n4. Enviando encuesta minima..." -ForegroundColor Yellow

$encuestaJson = $encuestaMinima | ConvertTo-Json -Depth 10

try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta" -Method POST -Body $encuestaJson -Headers $headers
    Write-Host "ENCUESTA CREADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "Familia: $($encuestaMinima.informacionGeneral.apellido_familiar)" -ForegroundColor Cyan
    Write-Host "Miembros: $($encuestaMinima.familyMembers.Count)" -ForegroundColor Cyan
    Write-Host "`nRespuesta completa:" -ForegroundColor Yellow
    Write-Host ($resultado | ConvertTo-Json -Depth 3) -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`nPRUEBA COMPLETADA!" -ForegroundColor Green
