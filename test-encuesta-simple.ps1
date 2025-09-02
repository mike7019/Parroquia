# Test encuesta simple con datos basicos
Write-Host "=== TEST ENCUESTA SIMPLE ===" -ForegroundColor Green

$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "Login OK" -ForegroundColor Green
} catch {
    Write-Host "Login FAIL" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`nObteniendo datos basicos..." -ForegroundColor Yellow

# Municipio
$municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=1" -Headers $headers -Method GET
$municipio = $municipios.data[0]

# Sexos
$sexos = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Headers $headers -Method GET
$masculino = $sexos.data | Where-Object { $_.nombre -like "*Masculino*" } | Select-Object -First 1
$femenino = $sexos.data | Where-Object { $_.nombre -like "*Femenino*" } | Select-Object -First 1

# Tipos ID
$tiposId = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/tipos-identificacion" -Method GET
$tipoCC = $tiposId.data[0]

Write-Host "Municipio: $($municipio.nombre_municipio)" -ForegroundColor Cyan
Write-Host "Sexos: M=$($masculino.nombre), F=$($femenino.nombre)" -ForegroundColor Cyan  
Write-Host "Tipo ID: $($tipoCC.nombre)" -ForegroundColor Cyan

Write-Host "`nCreando encuesta simple..." -ForegroundColor Yellow

$encuestaSimple = @{
    informacionGeneral = @{
        municipio = @{
            id = $municipio.id_municipio
            nombre = $municipio.nombre_municipio
        }
        parroquia = @{ id = 1; nombre = "Parroquia Default" }
        sector = @{ id = 1; nombre = "Sector Default" }
        vereda = @{ id = 1; nombre = "Vereda Default" }
        fecha = "2025-01-02"
        apellido_familiar = "Familia Test"
        direccion = "Calle 123 # 45-67"
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
        sustento_familia = "Trabajo independiente"
        observaciones_encuestador = "Encuesta de prueba"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Juan Carlos Perez"
            numeroIdentificacion = "12345678"
            tipoIdentificacion = @{
                id = $tipoCC.id
                nombre = $tipoCC.nombre
            }
            fechaNacimiento = "1985-01-15"
            sexo = @{
                id = $masculino.id
                nombre = $masculino.nombre
            }
            telefono = "3001234567"
            situacionCivil = @{ id = 1; nombre = "Soltero" }
            estudio = @{ id = 1; nombre = "Bachiller" }
            parentesco = @{ id = 1; nombre = "Jefe Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "M"
            talla_pantalon = "32"
            talla_zapato = "41"
            ocupacion = @{ id = 1; nombre = "Empleado" }
            discapacidad = @{ id = 1; nombre = "Ninguna" }
            bautizado = $true
            confirmado = $false
            primera_comunion = $true
            casado_iglesia = $false
        }
    )
    deceasedMembers = @()
}

$encuestaJson = $encuestaSimple | ConvertTo-Json -Depth 10

Write-Host "`nEnviando encuesta..." -ForegroundColor Yellow
try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta" -Method POST -Body $encuestaJson -Headers $headers
    Write-Host "ENCUESTA CREADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "Detalles:" -ForegroundColor Cyan
    Write-Host ($resultado | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nPRUEBA COMPLETADA" -ForegroundColor Green
