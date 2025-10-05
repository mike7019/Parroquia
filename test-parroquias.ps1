# Test del endpoint de parroquias

Write-Host "Test: Consultar Parroquias" -ForegroundColor Cyan
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

# 2. Consultar parroquias
Write-Host "2. Consultando parroquias..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }

    $response = Invoke-RestMethod -Uri "$baseUrl/api/parroquias" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "   Consulta exitosa" -ForegroundColor Green
    Write-Host ""

    # Mostrar resultados
    Write-Host "PARROQUIAS ENCONTRADAS: $($response.total)" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Gray
    
    $contador = 1
    foreach ($parroquia in $response.datos) {
        Write-Host ""
        Write-Host "$contador. $($parroquia.nombre_parroquia)" -ForegroundColor White
        Write-Host "   ID: $($parroquia.id_parroquia)" -ForegroundColor Gray
        Write-Host "   Municipio: $($parroquia.nombre_municipio)" -ForegroundColor Gray
        Write-Host "   Departamento: $($parroquia.nombre_departamento)" -ForegroundColor Gray
        Write-Host "   Total Familias: $($parroquia.total_familias)" -ForegroundColor Yellow
        Write-Host "   Total Personas: $($parroquia.total_personas)" -ForegroundColor Yellow
        
        $contador++
        
        # Limitar a 10 parroquias
        if ($contador -gt 10) {
            $restantes = $response.total - 10
            if ($restantes -gt 0) {
                Write-Host ""
                Write-Host "   ... y $restantes parroquia(s) mas" -ForegroundColor Gray
            }
            break
        }
    }

    Write-Host ""
    Write-Host "=======================" -ForegroundColor Gray
    
    # Mostrar estructura JSON de la primera parroquia
    Write-Host ""
    Write-Host "ESTRUCTURA DE DATOS (Primera Parroquia):" -ForegroundColor Cyan
    if ($response.datos.Count -gt 0) {
        $response.datos[0] | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
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
