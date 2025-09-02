# Debug estructura DB
Write-Host "=== DEBUG ESTRUCTURA BD ===" -ForegroundColor Green

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

# Test parroquias endpoint
Write-Host "`nTesting parroquias endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method GET -ErrorAction Stop
    Write-Host "Response parroquias:"
    Write-Host ($response | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "Error parroquias: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test sectors endpoint
Write-Host "`nTesting sectors endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sectors" -Headers $headers -Method GET -ErrorAction Stop
    Write-Host "Response sectors:"
    Write-Host ($response | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "Error sectors: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test crear parroquia simple
Write-Host "`nTesting crear parroquia..." -ForegroundColor Yellow
$testParroquia = @{
    nombre = "Test Parroquia"
    id_municipio = 19
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parroquias" -Headers $headers -Method POST -Body $testParroquia -ContentType "application/json" -ErrorAction Stop
    Write-Host "Parroquia creada exitosamente:"
    Write-Host ($response | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "Error creando parroquia: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}
