# SCRIPT FINAL - Prueba completa de creacion de encuesta
# Con estructura de datos correcta y ruta correcta
Write-Host "=== PRUEBA COMPLETA DE ENCUESTA (CORREGIDA) ===" -ForegroundColor Green

# 1. LOGIN
Write-Host "`n1. Realizando login..." -ForegroundColor Yellow
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login exitoso - Token: $($token.Length) chars" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. OBTENER CATALOGOS (estructura corregida: data en lugar de datos)
Write-Host "`n2. Obteniendo catalogos..." -ForegroundColor Yellow

# Municipios
try {
    $municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Headers $headers -Method GET
    if ($municipios.data -and $municipios.data.Count -gt 0) {
        $municipio = $municipios.data[0]
        Write-Host "✅ Municipios: $($municipio.nombre) (ID: $($municipio.id))" -ForegroundColor Green
    } else {
        $municipio = @{ id = 1; nombre = "Medellin" }
        Write-Host "⚠️ Sin municipios - usando default" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error municipios: $_" -ForegroundColor Red
    $municipio = @{ id = 1; nombre = "Medellin" }
}

# Sexos  
try {
    $sexos = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Headers $headers -Method GET
    if ($sexos.data -and $sexos.data.Count -gt 0) {
        $masculino = $sexos.data | Where-Object { $_.nombre -like "*Masculino*" -or $_.nombre -like "*Hombre*" } | Select-Object -First 1
        $femenino = $sexos.data | Where-Object { $_.nombre -like "*Femenino*" -or $_.nombre -like "*Mujer*" } | Select-Object -First 1
        if (-not $masculino) { $masculino = $sexos.data[0] }
        if (-not $femenino) { $femenino = $sexos.data[1] }
        Write-Host "✅ Sexos: M=$($masculino.id), F=$($femenino.id)" -ForegroundColor Green
    } else {
        $masculino = @{ id = 1; nombre = "Masculino" }
        $femenino = @{ id = 2; nombre = "Femenino" }
        Write-Host "⚠️ Sin sexos - usando default" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error sexos: $_" -ForegroundColor Red
    $masculino = @{ id = 1; nombre = "Masculino" }
    $femenino = @{ id = 2; nombre = "Femenino" }
}

# Tipos ID (publico)
try {
    $tiposId = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/tipos-identificacion" -Method GET
    if ($tiposId.data -and $tiposId.data.Count -gt 0) {
        $tipoCC = $tiposId.data | Where-Object { $_.nombre -like "*Cedula*" } | Select-Object -First 1
        if (-not $tipoCC) { $tipoCC = $tiposId.data[0] }
        Write-Host "✅ Tipo ID: $($tipoCC.nombre) (ID: $($tipoCC.id))" -ForegroundColor Green
    } else {
        $tipoCC = @{ id = 1; nombre = "Cedula Ciudadania" }
        Write-Host "⚠️ Sin tipos ID - usando default" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error tipos ID: $_" -ForegroundColor Red
    $tipoCC = @{ id = 1; nombre = "Cedula Ciudadania" }
}

# 3. CONSTRUIR ENCUESTA COMPLETA
Write-Host "`n3. Construyendo encuesta completa..." -ForegroundColor Yellow

$encuestaCompleta = @{
    informacionGeneral = @{
        municipio = $municipio
        parroquia = @{ id = 1; nombre = "San Jose" }
        sector = @{ id = 1; nombre = "Centro" }
        vereda = @{ id = 1; nombre = "La Macarena" }
        fecha = "2025-01-02"
        apellido_familiar = "Rodriguez Garcia"
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
        sustento_familia = "Trabajo independiente en ventas"
        observaciones_encuestador = "Familia muy colaborativa durante encuesta"
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Carlos Andres Rodriguez Garcia"
            numeroIdentificacion = "12345678"
            tipoIdentificacion = $tipoCC
            fechaNacimiento = "1985-03-15"
            sexo = $masculino
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
            nombres = "Maria Elena Garcia Lopez"
            numeroIdentificacion = "87654321"
            tipoIdentificacion = $tipoCC
            fechaNacimiento = "1988-07-20"
            sexo = $femenino
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
            nombres = "Pedro Rodriguez Fernandez"
            numeroIdentificacion = "11111111"
            tipoIdentificacion = $tipoCC
            fechaNacimiento = "1950-12-10"
            fechaFallecimiento = "2020-05-15"
            sexo = $masculino
            parentesco = @{ id = 5; nombre = "Abuelo" }
            causaFallecimiento = "Enfermedad natural"
            lugarFallecimiento = "Hospital San Vicente"
        }
    )
}

# 4. ENVIAR ENCUESTA (ruta corregida: /api/encuesta en lugar de /api/encuestas)
Write-Host "`n4. Enviando encuesta..." -ForegroundColor Yellow

$encuestaJson = $encuestaCompleta | ConvertTo-Json -Depth 10

try {
    $resultado = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta" -Method POST -Body $encuestaJson -Headers $headers
    Write-Host "✅ ENCUESTA CREADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "Respuesta:" -ForegroundColor Cyan
    Write-Host ($resultado | ConvertTo-Json -Depth 3) -ForegroundColor Gray
} catch {
    Write-Host "❌ Error creando encuesta: $_" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== PRUEBA COMPLETA FINALIZADA ===" -ForegroundColor Green
