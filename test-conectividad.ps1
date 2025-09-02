# Test simple de conectividad
Write-Host "=== TEST CONECTIVIDAD ==="

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "Health check OK: $($health | ConvertTo-Json)"
} catch {
    Write-Host "Health check FAIL: $_"
}

try {
    $municipios = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method GET
    Write-Host "Municipios sin auth: $($municipios | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "Municipios sin auth FAIL (normal): $_"
}
