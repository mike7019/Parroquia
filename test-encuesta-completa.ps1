# Script para prueba completa de creación de encuesta
# Autor: Assistant
# Fecha: 2025-09-01

Write-Host "=== INICIO DE PRUEBA COMPLETA DE ENCUESTA ===" -ForegroundColor Green

# 1. Login para obtener token de autenticación
Write-Host "`n1. Realizando login..." -ForegroundColor Yellow
$loginData = @{
    correo_electronico = "admin@parroquia.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Headers @{ "Content-Type" = "application/json" } -Method POST -Body $loginData
    $token = $loginResponse.datos.token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token obtenido: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}

# Headers para autenticación
$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Obtener datos de catálogos necesarios
Write-Host "`n2. Obteniendo datos de catálogos..." -ForegroundColor Yellow

# Tipos de identificación (público)
Write-Host "  - Tipos de identificación"
$tiposId = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/tipos-identificacion" -Method GET
$primerTipoId = $tiposId.data[0]

# Municipios
Write-Host "  - Municipios"
try {
    $municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios?limit=5" -Headers $authHeaders -Method GET
    $primerMunicipio = $municipios.datos[0]
    Write-Host "    Primer municipio: $($primerMunicipio.nombre) (ID: $($primerMunicipio.id))"
} catch {
    Write-Host "    ⚠️ Error obteniendo municipios: $_" -ForegroundColor Yellow
    # Usar datos por defecto
    $primerMunicipio = @{ id = 1; nombre = "Medellín" }
}

# Sectores
Write-Host "  - Sectores"
try {
    $sectores = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectores?limit=5" -Headers $authHeaders -Method GET
    $primerSector = $sectores.datos[0]
    Write-Host "    Primer sector: $($primerSector.nombre) (ID: $($primerSector.id))"
} catch {
    Write-Host "    ⚠️ Error obteniendo sectores: $_" -ForegroundColor Yellow
    $primerSector = @{ id = 1; nombre = "Centro" }
}

# Sexos
Write-Host "  - Sexos"
try {
    $sexos = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos?limit=5" -Headers $authHeaders -Method GET
    $masculino = $sexos.datos | Where-Object { $_.nombre -like "*Masculino*" -or $_.nombre -like "*Hombre*" } | Select-Object -First 1
    $femenino = $sexos.datos | Where-Object { $_.nombre -like "*Femenino*" -or $_.nombre -like "*Mujer*" } | Select-Object -First 1
    
    if (-not $masculino) { $masculino = @{ id = 1; nombre = "Masculino" } }
    if (-not $femenino) { $femenino = @{ id = 2; nombre = "Femenino" } }
    
    Write-Host "    Masculino: $($masculino.nombre) (ID: $($masculino.id))"
    Write-Host "    Femenino: $($femenino.nombre) (ID: $($femenino.id))"
} catch {
    Write-Host "    ⚠️ Error obteniendo sexos: $_" -ForegroundColor Yellow
    $masculino = @{ id = 1; nombre = "Masculino" }
    $femenino = @{ id = 2; nombre = "Femenino" }
}

Write-Host "✅ Datos de catálogos obtenidos" -ForegroundColor Green

# 3. Construir encuesta completa con todos los datos válidos
Write-Host "`n3. Construyendo encuesta completa..." -ForegroundColor Yellow

$fechaActual = Get-Date -Format "yyyy-MM-dd"
$fechaNacimiento = "1985-03-15"
$fechaNacimientoHija = "2010-07-22"
$fechaFallecimientoAbuelo = "2020-05-15"

$encuestaCompleta = @{
    informacionGeneral = @{
        municipio = $primerMunicipio
        parroquia = @{ id = 1; nombre = "San José" }
        sector = $primerSector
        vereda = @{ id = 1; nombre = "La Macarena" }
        fecha = $fechaActual
        apellido_familiar = "Rodríguez García"
        direccion = "Carrera 45 # 23-67, Apartamento 301"
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
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Público" }
        aguas_residuales = @{ id = 1; nombre = "Alcantarillado Público" }
        pozo_septico = $false
        letrina = $false
        campo_abierto = $false
    }
    observaciones = @{
        sustento_familia = "Trabajo independiente en ventas y comercio electrónico. Ingresos estables mensuales."
        observaciones_encuestador = "Familia muy colaborativa durante la encuesta. Información completa y verificada. Viven en apartamento propio en zona residencial."
        autorizacion_datos = $true
    }
    familyMembers = @(
        @{
            nombres = "Carlos Andrés Rodríguez García"
            numeroIdentificacion = "12345678"
            tipoIdentificacion = $primerTipoId
            fechaNacimiento = $fechaNacimiento
            sexo = $masculino
            telefono = "3001234567"
            situacionCivil = @{ id = 1; nombre = "Casado Civil" }
            estudio = @{ id = 1; nombre = "Universitario Completo" }
            parentesco = @{ id = 1; nombre = "Jefe de Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 2; nombre = "Diabetes Tipo 2" }
            "talla_camisa/blusa" = "L"
            talla_pantalon = "32"
            talla_zapato = "42"
            profesion = @{ id = 1; nombre = "Comerciante" }
            motivoFechaCelebrar = @{
                motivo = "Cumpleaños"
                dia = "15"
                mes = "03"
            }
        },
        @{
            nombres = "María Elena García Fernández"
            numeroIdentificacion = "87654321"
            tipoIdentificacion = $primerTipoId
            fechaNacimiento = "1988-07-10"
            sexo = $femenino
            telefono = "3009876543"
            situacionCivil = @{ id = 2; nombre = "Casada Civil" }
            estudio = @{ id = 2; nombre = "Técnico" }
            parentesco = @{ id = 2; nombre = "Esposa" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "M"
            talla_pantalon = "28"
            talla_zapato = "37"
            profesion = @{ id = 2; nombre = "Enfermera" }
            motivoFechaCelebrar = @{
                motivo = "Cumpleaños"
                dia = "10"
                mes = "07"
            }
        },
        @{
            nombres = "Isabella Rodríguez García"
            numeroIdentificacion = "1234567890"
            tipoIdentificacion = @{ id = 2; nombre = "Tarjeta de Identidad" }
            fechaNacimiento = $fechaNacimientoHija
            sexo = $femenino
            telefono = ""
            situacionCivil = @{ id = 3; nombre = "Soltera" }
            estudio = @{ id = 3; nombre = "Básica Secundaria" }
            parentesco = @{ id = 3; nombre = "Hija" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "S"
            talla_pantalon = "26"
            talla_zapato = "35"
            profesion = @{ id = 3; nombre = "Estudiante" }
            motivoFechaCelebrar = @{
                motivo = "Cumpleaños"
                dia = "22"
                mes = "07"
            }
        }
    )
    deceasedMembers = @(
        @{
            nombres = "Pedro Antonio Rodríguez López"
            numeroIdentificacion = "98765432"
            fechaFallecimiento = $fechaFallecimientoAbuelo
            fechaAniversario = $fechaFallecimientoAbuelo
            sexo = $masculino
            parentesco = @{ id = "PADRE"; nombre = "Padre" }
            causaFallecimiento = "Enfermedad cardiovascular - Infarto agudo de miocardio"
            eraPadre = $true
            eraMadre = $false
        }
    )
    metadata = @{
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
        completed = $true
        currentStage = 6
        version = "1.0"
        encuestador = "Sistema de Pruebas Automatizadas"
    }
}

Write-Host "✅ Encuesta construida con:" -ForegroundColor Green
Write-Host "  - Información general completa"
Write-Host "  - 3 miembros de familia vivos"
Write-Host "  - 1 miembro fallecido"
Write-Host "  - Todos los datos de vivienda y servicios"
Write-Host "  - Observaciones y autorizaciones"

# 4. Enviar encuesta a la API
Write-Host "`n4. Enviando encuesta a la API..." -ForegroundColor Yellow

$encuestaJson = $encuestaCompleta | ConvertTo-Json -Depth 10

try {
    Write-Host "  - Realizando petición POST..."
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta" -Headers $authHeaders -Method POST -Body $encuestaJson
    
    Write-Host "✅ ¡ENCUESTA CREADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "`n=== RESPUESTA DE LA API ===" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
    # Guardar el ID de la familia para pruebas posteriores
    $familiaId = $response.data.familia_id
    Write-Host "`n✅ ID de familia creada: $familiaId" -ForegroundColor Green
    
    # 5. Verificar la encuesta creada
    Write-Host "`n5. Verificando encuesta creada..." -ForegroundColor Yellow
    try {
        $encuestaVerificacion = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta/$familiaId" -Headers $authHeaders -Method GET
        Write-Host "✅ Encuesta verificada correctamente" -ForegroundColor Green
        Write-Host "  - Apellido familiar: $($encuestaVerificacion.data.apellido_familiar)"
        Write-Host "  - Total miembros: $($encuestaVerificacion.data.miembros_vivos.Count)"
        Write-Host "  - Total fallecidos: $($encuestaVerificacion.data.miembros_fallecidos.Count)"
    } catch {
        Write-Host "⚠️ Error verificando encuesta: $_" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ ERROR AL CREAR ENCUESTA:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host "Detalles del error:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
}

Write-Host "`n=== FIN DE PRUEBA COMPLETA ===" -ForegroundColor Green
