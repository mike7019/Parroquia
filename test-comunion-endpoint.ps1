# Script PowerShell para probar el campo "comunionEnCasa" en la API de encuestas
# Autor: Sistema de Encuestas Parroquiales
# Fecha: 2025-08-26

Write-Host "🧪 PRUEBA DEL CAMPO 'comunionEnCasa'" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Configuración
$baseUrl = "http://localhost:3000"
$endpoint = "$baseUrl/api/encuesta"

# Headers comunes
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# JSON de prueba CON comunionEnCasa = true
$encuestaConComunion = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellín" }
        parroquia = @{ id = 1; nombre = "San José" }
        sector = @{ id = 1; nombre = "Centro" }
        vereda = @{ id = 1; nombre = "La Macarena" }
        fecha = "2025-08-26"
        apellido_familiar = "García Comunión"
        direccion = "Calle 50 # 30-25"
        telefono = "3007654321"
        numero_contrato_epm = "87654321"
        email = "garcia.comunion@email.com"
        comunionEnCasa = $true  # ✅ NUEVO CAMPO
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
    }
    observaciones = "Familia que realiza comunión en casa los domingos"
    familyMembers = @(
        @{
            nombres = "María José García López"
            numeroIdentificacion = "43987654"
            tipoIdentificacion = @{ id = 1; nombre = "Cédula de Ciudadanía" }
            fechaNacimiento = "1990-05-20"
            sexo = @{ id = 2; nombre = "Femenino" }
            telefono = "3007654321"
            situacionCivil = @{ id = 1; nombre = "Soltera" }
            estudio = @{ id = 3; nombre = "Secundaria" }
            parentesco = @{ id = 1; nombre = "Jefe de Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "M"
            talla_pantalon = "30"
            talla_zapato = "37"
            profesion = @{ id = 5; nombre = "Ama de Casa" }
        }
    )
    deceasedMembers = @()
}

# JSON de prueba SIN comunionEnCasa (campo opcional)
$encuestaSinComunion = @{
    informacionGeneral = @{
        municipio = @{ id = 1; nombre = "Medellín" }
        parroquia = @{ id = 1; nombre = "San José" }
        sector = @{ id = 1; nombre = "Centro" }
        vereda = @{ id = 1; nombre = "La Macarena" }
        fecha = "2025-08-26"
        apellido_familiar = "Martínez Normal"
        direccion = "Carrera 80 # 45-12"
        telefono = "3012345678"
        numero_contrato_epm = "11223344"
        email = "martinez.normal@email.com"
        # comunionEnCasa NO está presente (debe ser false por defecto)
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
        sistema_acueducto = @{ id = 1; nombre = "Acueducto Público" }
    }
    observaciones = "Familia sin comunión en casa"
    familyMembers = @(
        @{
            nombres = "Carlos Martínez Pérez"
            numeroIdentificacion = "12345678"
            tipoIdentificacion = @{ id = 1; nombre = "Cédula de Ciudadanía" }
            fechaNacimiento = "1985-03-15"
            sexo = @{ id = 1; nombre = "Masculino" }
            telefono = "3012345678"
            situacionCivil = @{ id = 2; nombre = "Casado Civil" }
            estudio = @{ id = 4; nombre = "Universitario" }
            parentesco = @{ id = 1; nombre = "Jefe de Hogar" }
            comunidadCultural = @{ id = 1; nombre = "Ninguna" }
            enfermedad = @{ id = 1; nombre = "Ninguna" }
            "talla_camisa/blusa" = "L"
            talla_pantalon = "32"
            talla_zapato = "42"
            profesion = @{ id = 2; nombre = "Empleado" }
        }
    )
    deceasedMembers = @()
}

# Función para mostrar estructura JSON
function Show-JsonStructure {
    param (
        [string]$Title,
        [hashtable]$Data
    )
    
    Write-Host "`n📋 $Title" -ForegroundColor Cyan
    Write-Host ("=" * ($Title.Length + 3)) -ForegroundColor Cyan
    
    $jsonString = $Data | ConvertTo-Json -Depth 10
    Write-Host "Tamaño del JSON: $($jsonString.Length) caracteres" -ForegroundColor Yellow
    
    # Mostrar información clave
    $info = $Data.informacionGeneral
    Write-Host "Apellido: $($info.apellido_familiar)" -ForegroundColor White
    Write-Host "Dirección: $($info.direccion)" -ForegroundColor White
    Write-Host "Teléfono: $($info.telefono)" -ForegroundColor White
    Write-Host "Comunión en casa: $($info.comunionEnCasa)" -ForegroundColor Yellow
    Write-Host "Miembros familia: $($Data.familyMembers.Count)" -ForegroundColor White
}

# Función para probar endpoint
function Test-EncuestaEndpoint {
    param (
        [string]$TestName,
        [hashtable]$EncuestaData,
        [string]$JwtToken = $null
    )
    
    Write-Host "`n🚀 PROBANDO: $TestName" -ForegroundColor Green
    Write-Host ("=" * ($TestName.Length + 11)) -ForegroundColor Green
    
    try {
        # Convertir a JSON
        $jsonBody = $EncuestaData | ConvertTo-Json -Depth 10
        
        # Agregar token si está disponible
        $testHeaders = $headers.Clone()
        if ($JwtToken) {
            $testHeaders["Authorization"] = "Bearer $JwtToken"
        }
        
        Write-Host "📤 Enviando request a: $endpoint" -ForegroundColor Cyan
        Write-Host "📦 Tamaño del body: $($jsonBody.Length) bytes" -ForegroundColor Cyan
        
        # Realizar la petición
        $response = Invoke-RestMethod -Uri $endpoint -Method POST -Headers $testHeaders -Body $jsonBody -ErrorAction Stop
        
        Write-Host "✅ RESPUESTA EXITOSA:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Green
        
        return $true
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        
        Write-Host "❌ ERROR en $TestName" -ForegroundColor Red
        Write-Host "Código: $statusCode - $statusDescription" -ForegroundColor Red
        
        try {
            $errorBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorBody)
            $errorText = $reader.ReadToEnd()
            $reader.Close()
            
            if ($errorText) {
                $errorJson = $errorText | ConvertFrom-Json
                Write-Host "Detalles del error:" -ForegroundColor Yellow
                Write-Host ($errorJson | ConvertTo-Json -Depth 3) -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Error al leer detalles: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        return $false
    }
}

# Función para verificar servidor
function Test-ServerConnection {
    Write-Host "`n🔍 Verificando conexión al servidor..." -ForegroundColor Cyan
    
    try {
        $healthCheck = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
        Write-Host "✅ Servidor respondiendo correctamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Servidor no disponible en $baseUrl" -ForegroundColor Red
        Write-Host "Asegúrate de que el servidor esté ejecutándose con: npm run dev" -ForegroundColor Yellow
        return $false
    }
}

# EJECUCIÓN PRINCIPAL
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Gray

# Mostrar estructuras
Show-JsonStructure "Encuesta CON Comunión" $encuestaConComunion
Show-JsonStructure "Encuesta SIN Comunión" $encuestaSinComunion

# Verificar servidor
if (-not (Test-ServerConnection)) {
    Write-Host "`n❌ No se puede continuar sin el servidor ejecutándose" -ForegroundColor Red
    exit 1
}

# Solicitar JWT token
Write-Host "`n🔐 TOKEN DE AUTENTICACIÓN" -ForegroundColor Yellow
Write-Host "Para probar completamente, necesitas un JWT token válido." -ForegroundColor Yellow
Write-Host "Si no tienes uno, el test fallará con 401 Unauthorized." -ForegroundColor Yellow

$jwtToken = Read-Host "Ingresa tu JWT token (o presiona Enter para probar sin token)"

# Ejecutar pruebas
$test1 = Test-EncuestaEndpoint "Encuesta CON comunionEnCasa=true" $encuestaConComunion $jwtToken
$test2 = Test-EncuestaEndpoint "Encuesta SIN comunionEnCasa (campo opcional)" $encuestaSinComunion $jwtToken

# Resumen
Write-Host "`n🎉 RESUMEN DE PRUEBAS" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green

if ($test1) {
    Write-Host "✅ Prueba 1 (CON comunión): EXITOSA" -ForegroundColor Green
} else {
    Write-Host "❌ Prueba 1 (CON comunión): FALLÓ" -ForegroundColor Red
}

if ($test2) {
    Write-Host "✅ Prueba 2 (SIN comunión): EXITOSA" -ForegroundColor Green
} else {
    Write-Host "❌ Prueba 2 (SIN comunión): FALLÓ" -ForegroundColor Red
}

Write-Host "`n📋 COMANDOS CURL EQUIVALENTES:" -ForegroundColor Cyan
Write-Host "curl -X POST $endpoint \\" -ForegroundColor Gray
Write-Host '  -H "Content-Type: application/json" \' -ForegroundColor Gray
Write-Host '  -H "Authorization: Bearer YOUR_JWT_TOKEN" \' -ForegroundColor Gray
Write-Host "  -d @encuesta-con-comunion.json" -ForegroundColor Gray

Write-Host "`n📚 DOCUMENTACIÓN:"
Write-Host "Swagger UI: $baseUrl/api-docs" -ForegroundColor Blue

Write-Host "`n🏁 Pruebas completadas!" -ForegroundColor Green
