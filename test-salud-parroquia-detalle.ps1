# Test del endpoint de salud por parroquia con detalle de personas

Write-Host "Test: Salud por Parroquia con Detalle de Personas" -ForegroundColor Cyan
Write-Host ""

# Configuracion
$baseUrl = "http://localhost:3000"
$email = "admin@parroquia.com"
$password = "Admin123!"

# 1. Login
Write-Host "1. Autenticando..." -ForegroundColor Yellow
try {
    $loginBody = @{
        correo_electronico = $email
        contrasena = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $loginResponse.data.accessToken
    Write-Host "   Login exitoso" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Consultar salud por parroquia
Write-Host "2. Consultando salud de parroquia ID 1..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }

    $response = Invoke-RestMethod -Uri "$baseUrl/api/personas/salud/parroquia/1" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "   Consulta exitosa" -ForegroundColor Green
    Write-Host ""

    # Mostrar resumen
    Write-Host "RESUMEN ESTADISTICO" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Gray
    Write-Host "Parroquia:        $($response.datos.resumen.nombre_parroquia)" -ForegroundColor White
    Write-Host "Total Personas:   $($response.datos.resumen.total_personas)" -ForegroundColor White
    Write-Host "Con Enfermedades: $($response.datos.resumen.con_enfermedades)" -ForegroundColor Yellow
    Write-Host "Sin Enfermedades: $($response.datos.resumen.sin_enfermedades)" -ForegroundColor Green
    Write-Host "Edad Promedio:    $($response.datos.resumen.edad_promedio) años" -ForegroundColor White
    Write-Host ""

    # Mostrar detalle de personas
    Write-Host "DETALLE DE PERSONAS ($($response.datos.personas.Count))" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Gray
    
    $contador = 1
    foreach ($persona in $response.datos.personas) {
        Write-Host ""
        Write-Host "$contador. $($persona.nombre) ($($persona.edad) años)" -ForegroundColor White
        Write-Host "   Documento: $($persona.documento)" -ForegroundColor Gray
        Write-Host "   Sexo: $($persona.sexo)" -ForegroundColor Gray
        Write-Host "   Telefono: $($persona.telefono)" -ForegroundColor Gray
        Write-Host "   Familia: $($persona.familia.apellido)" -ForegroundColor Gray
        Write-Host "   Ubicacion: $($persona.ubicacion.sector), $($persona.ubicacion.municipio)" -ForegroundColor Gray
        
        if ($persona.salud.tiene_enfermedades) {
            Write-Host "   SALUD: Con enfermedades" -ForegroundColor Red
            $enfermedadesTexto = $persona.salud.enfermedades -join ", "
            Write-Host "      Enfermedades: $enfermedadesTexto" -ForegroundColor Red
        } else {
            Write-Host "   SALUD: Sin enfermedades registradas" -ForegroundColor Green
        }
        
        $contador++
        
        # Limitar a 10 personas
        if ($contador -gt 10) {
            $restantes = $response.datos.personas.Count - 10
            if ($restantes -gt 0) {
                Write-Host ""
                Write-Host "   ... y $restantes persona(s) mas" -ForegroundColor Gray
            }
            break
        }
    }

    Write-Host ""
    Write-Host "=======================" -ForegroundColor Gray
    
    # Mostrar estructura JSON completa (solo primera persona como ejemplo)
    Write-Host ""
    Write-Host "ESTRUCTURA DE DATOS (Primera Persona):" -ForegroundColor Cyan
    if ($response.datos.personas.Count -gt 0) {
        $response.datos.personas[0] | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Gray
    }
    
} catch {
    Write-Host "   Error en consulta: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "Test completado exitosamente" -ForegroundColor Green
