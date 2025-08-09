# Test Sistema de Acueducto API - Simple version
$baseUrl = "http://localhost:3000"

Write-Host "Testing Sistema de Acueducto API" -ForegroundColor Green

# Test catalog health
Write-Host "1. Testing catalog health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/health" -Method GET
    Write-Host "SUCCESS: Catalog health check passed" -ForegroundColor Green
    Write-Host "Sistema Acueducto status: $($response.services.sistemasAcueducto)" -ForegroundColor Cyan
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test authentication requirement
Write-Host "2. Testing authentication requirement..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/catalog/sistemas-acueducto" -Method GET
    Write-Host "FAILED: Should have required authentication" -ForegroundColor Red
}
catch {
    Write-Host "SUCCESS: Authentication required as expected" -ForegroundColor Green
}

Write-Host "Basic testing complete!" -ForegroundColor Green
