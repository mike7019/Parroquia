$baseUrl = "http://localhost:3000"

Write-Host "Testing System Endpoints..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health"
    Write-Host "PASS: Health Check - $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "FAIL: Health Check" -ForegroundColor Red
}

try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/status"
    Write-Host "PASS: System Status" -ForegroundColor Green
} catch {
    Write-Host "FAIL: System Status" -ForegroundColor Red
}

try {
    $cors = Invoke-RestMethod -Uri "$baseUrl/api/cors-test"
    Write-Host "PASS: CORS Test" -ForegroundColor Green
} catch {
    Write-Host "FAIL: CORS Test" -ForegroundColor Red
}

Write-Host "`nTesting Authentication..." -ForegroundColor Yellow

try {
    $loginBody = @{
        email = "testauth@example.com"
        password = "TestAuth123!"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "PASS: Login" -ForegroundColor Green
    
    $token = $loginResponse.data.accessToken
    $headers = @{ "Authorization" = "Bearer $token" }
    
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Headers $headers
    Write-Host "PASS: Get Profile - $($profile.email)" -ForegroundColor Green
    
} catch {
    Write-Host "FAIL: Authentication - $($_.Exception.Message)" -ForegroundColor Red
    $headers = @{}
}

Write-Host "`nTesting User Management..." -ForegroundColor Yellow

try {
    $users = Invoke-RestMethod -Uri "$baseUrl/api/users" -Headers $headers
    Write-Host "PASS: List Users - Found $($users.data.users.Count) users" -ForegroundColor Green
} catch {
    Write-Host "FAIL: List Users - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Catalog Endpoints..." -ForegroundColor Yellow

$catalogs = @("parroquias", "veredas", "municipios", "sexo", "estado-civil")

foreach ($catalog in $catalogs) {
    try {
        $items = Invoke-RestMethod -Uri "$baseUrl/api/catalog/$catalog" -Headers $headers
        Write-Host "PASS: $catalog - Found $($items.data.Count) items" -ForegroundColor Green
    } catch {
        Write-Host "FAIL: $catalog - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTesting Documentation..." -ForegroundColor Yellow

try {
    $swagger = Invoke-WebRequest -Uri "$baseUrl/api-docs"
    Write-Host "PASS: Swagger UI" -ForegroundColor Green
} catch {
    Write-Host "FAIL: Swagger UI" -ForegroundColor Red
}

Write-Host "`nEndpoint testing completed!" -ForegroundColor Cyan
