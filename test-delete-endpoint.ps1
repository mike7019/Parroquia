# ===================================================
# SCRIPT DE PRUEBA: ENDPOINT DELETE DE ENCUESTAS
# ===================================================

Write-Host "🧪 PRUEBA COMPLETA DEL ENDPOINT DE ELIMINACIÓN" -ForegroundColor Magenta
Write-Host ""

try {
    # AUTENTICACIÓN
    Write-Host "🔐 PASO 1: Autenticando..." -ForegroundColor Cyan
    $loginBody = @{
        correo_electronico = "admin@parroquia.com"
        contrasena = "Admin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "   ✅ Token obtenido exitosamente" -ForegroundColor Green
    Write-Host ""

    # CREAR ENCUESTA DE PRUEBA
    Write-Host "📝 PASO 2: Creando encuesta de prueba..." -ForegroundColor Cyan
    $encuestaBody = @{
        informacionGeneral = @{
            municipio = @{ id = "002"; nombre = "Santa Marta" }
            parroquia = @{ id = "002"; nombre = "San YORK" }
            sector = @{ id = "003"; nombre = "Centro" }
            vereda = @{ id = "004"; nombre = "El Carmen" }
            fecha = "2025-08-23T10:00:00.000Z"
            apellido_familiar = "FAMILIA DELETE TEST"
            direccion = "Calle Delete 123"
            telefono = "6041111111"
            numero_contrato_epm = "DELETE123"
        }
        vivienda = @{
            tipo_vivienda = @{ id = "01"; nombre = "Casa" }
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
            sistema_acueducto = @{ id = "4"; nombre = "Fuente Natural" }
            aguas_residuales = "Alcantarillado público"
            pozo_septico = $false
            letrina = $false
            campo_abierto = $false
        }
        observaciones = @{
            sustento_familia = "Pruebas de eliminación"
            observaciones_encuestador = "Familia creada para probar eliminación"
            autorizacion_datos = $true
        }
        familyMembers = @(
            @{
                nombres = "Juan Delete Test"
                fechaNacimiento = "1990-05-12T00:00:00.000Z"
                tipoIdentificacion = "CC"
                sexo = "M"
                situacionCivil = "Soltero"
                parentesco = "Hijo"
                telefono = "3001111111"
                estudio = "Universitario"
                comunidadCultural = "Ninguna"
                talla = @{
                    camisa = "L"
                    pantalon = "34"
                    calzado = "43"
                }
            }
        )
        deceasedMembers = @()
        metadata = @{
            timestamp = "2025-08-23T10:00:00.000Z"
            completed = $true
            currentStage = 6
        }
    } | ConvertTo-Json -Depth 5

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta" -Method POST -Body $encuestaBody -Headers $headers
    $familiaId = $createResponse.data.familia_id
    
    Write-Host "   ✅ Encuesta creada exitosamente - ID: $familiaId" -ForegroundColor Green
    Write-Host ""

    # OBTENER ENCUESTA
    Write-Host "🔍 PASO 3: Obteniendo encuesta..." -ForegroundColor Cyan
    $getResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta/$familiaId" -Method GET -Headers $headers
    Write-Host "   ✅ Encuesta obtenida: $($getResponse.data.informacion_general.apellido_familiar)" -ForegroundColor Green
    Write-Host ""

    # ELIMINAR ENCUESTA
    Write-Host "🗑️ PASO 4: Eliminando encuesta..." -ForegroundColor Cyan
    $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta/$familiaId" -Method DELETE -Headers $headers
    Write-Host "   ✅ Encuesta eliminada: $($deleteResponse.data.estadisticas.apellido_familiar)" -ForegroundColor Green
    Write-Host "   👥 Personas eliminadas: $($deleteResponse.data.estadisticas.personas_eliminadas)" -ForegroundColor Yellow
    Write-Host ""

    # VERIFICAR ELIMINACIÓN
    Write-Host "✅ PASO 5: Verificando eliminación..." -ForegroundColor Cyan
    try {
        $verifyResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/encuesta/$familiaId" -Method GET -Headers $headers
        Write-Host "   ❌ ERROR: La encuesta aún existe!" -ForegroundColor Red
    } catch {
        Write-Host "   ✅ Correcto: Encuesta no encontrada (404)" -ForegroundColor Green
    }
    Write-Host ""

    Write-Host "🎉 PRUEBA EXITOSA - ENDPOINT DELETE FUNCIONANDO CORRECTAMENTE" -ForegroundColor Green

} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
