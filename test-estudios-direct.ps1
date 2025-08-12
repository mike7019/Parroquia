# Test directo de endpoints de estudios

$baseUrl = "http://localhost:3000/api"

Write-Host "🔍 Testing Estudios Endpoints..." -ForegroundColor Cyan

# Test sin autenticación - debería dar 401
Write-Host "`n1. Testing GET /catalog/estudios (sin auth):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/catalog/estudios" -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code:" $_.Exception.Response.StatusCode -ForegroundColor Red
        Write-Host "Status Description:" $_.Exception.Response.StatusDescription -ForegroundColor Red
    }
}

# Test de health de catálogo
Write-Host "`n2. Testing GET /catalog/health:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/catalog/health" -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error:" $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🏁 Test completed" -ForegroundColor Cyan
