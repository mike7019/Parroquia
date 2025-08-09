# Test del servicio de Sistemas de Acueducto

# Variables
$BASE_URL = "http://localhost:3000/api"
$AUTH_TOKEN = "your-jwt-token-here"  # Reemplazar con un token válido

# Headers
$headers = @{
    "Authorization" = "Bearer $AUTH_TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "=== TESTING SISTEMAS DE ACUEDUCTO API ===" -ForegroundColor Green

# Test 1: Health check
Write-Host "`n1. Testing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/health" -Method GET -Headers $headers
    Write-Host "✅ Health check: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create sistema de acueducto
Write-Host "`n2. Creating new sistema de acueducto..." -ForegroundColor Yellow
$newSistema = @{
    proveedor = "Acueducto Veredal"
    metodo_abastecimiento = "Captación de manantial"
    descripcion = "Sistema comunitario de agua potable mediante captación de manantial natural"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto" -Method POST -Headers $headers -Body $newSistema
    $sistemaId = $response.data.id_sistemas_acueducto
    Write-Host "✅ Sistema created with ID: $sistemaId" -ForegroundColor Green
} catch {
    Write-Host "❌ Creation failed: $($_.Exception.Message)" -ForegroundColor Red
    $sistemaId = 1  # Fallback ID for other tests
}

# Test 3: Get all sistemas
Write-Host "`n3. Getting all sistemas de acueducto..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto?page=1&limit=5" -Method GET -Headers $headers
    Write-Host "✅ Retrieved $($response.data.sistemasAcueducto.Count) sistemas (Total: $($response.data.pagination.totalCount))" -ForegroundColor Green
} catch {
    Write-Host "❌ Get all failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get sistema by ID
Write-Host "`n4. Getting sistema by ID..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/$sistemaId" -Method GET -Headers $headers
    Write-Host "✅ Retrieved sistema: $($response.data.proveedor) - $($response.data.metodo_abastecimiento)" -ForegroundColor Green
} catch {
    Write-Host "❌ Get by ID failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Search sistemas
Write-Host "`n5. Searching sistemas de acueducto..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/search?q=municipal&limit=10" -Method GET -Headers $headers
    Write-Host "✅ Search found $($response.data.Count) sistemas" -ForegroundColor Green
} catch {
    Write-Host "❌ Search failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get unique providers
Write-Host "`n6. Getting unique providers..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/providers" -Method GET -Headers $headers
    Write-Host "✅ Found $($response.data.Count) unique providers: $($response.data -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "❌ Get providers failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get unique methods
Write-Host "`n7. Getting unique methods..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/methods" -Method GET -Headers $headers
    Write-Host "✅ Found $($response.data.Count) unique methods: $($response.data -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "❌ Get methods failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Get statistics
Write-Host "`n8. Getting statistics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/stats" -Method GET -Headers $headers
    Write-Host "✅ Statistics:" -ForegroundColor Green
    Write-Host "   - Total sistemas: $($response.data.totalSistemas)" -ForegroundColor Cyan
    Write-Host "   - Total providers: $($response.data.totalProviders)" -ForegroundColor Cyan
    Write-Host "   - Total methods: $($response.data.totalMethods)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get statistics failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Update sistema
Write-Host "`n9. Updating sistema de acueducto..." -ForegroundColor Yellow
$updateData = @{
    descripcion = "Sistema comunitario de agua potable mediante captación de manantial natural - ACTUALIZADO"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/$sistemaId" -Method PUT -Headers $headers -Body $updateData
    Write-Host "✅ Sistema updated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Get systems by provider
Write-Host "`n10. Getting systems by provider..." -ForegroundColor Yellow
try {
    $provider = "Municipal"
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/provider/$provider" -Method GET -Headers $headers
    Write-Host "✅ Found $($response.data.Count) sistemas for provider '$provider'" -ForegroundColor Green
} catch {
    Write-Host "❌ Get by provider failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: Bulk create
Write-Host "`n11. Bulk creating sistemas..." -ForegroundColor Yellow
$bulkData = @{
    sistemas = @(
        @{
            proveedor = "Junta de Acueducto Local"
            metodo_abastecimiento = "Bomba eléctrica"
            descripcion = "Sistema con bomba eléctrica para extracción de agua subterránea"
        },
        @{
            proveedor = "Cooperativa de Agua"
            metodo_abastecimiento = "Tanque de almacenamiento"
            descripcion = "Sistema cooperativo con tanques de almacenamiento y distribución por gravedad"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/bulk" -Method POST -Headers $headers -Body $bulkData
    Write-Host "✅ Bulk created $($response.data.Count) sistemas" -ForegroundColor Green
} catch {
    Write-Host "❌ Bulk create failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 12: Filter by provider and method
Write-Host "`n12. Testing filters..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto?proveedor=municipal&metodo_abastecimiento=red&page=1&limit=5" -Method GET -Headers $headers
    Write-Host "✅ Filtered results: $($response.data.sistemasAcueducto.Count) sistemas" -ForegroundColor Green
} catch {
    Write-Host "❌ Filter test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 13: Delete sistema (cleanup)
Write-Host "`n13. Deleting test sistema..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/catalog/sistemas-acueducto/$sistemaId" -Method DELETE -Headers $headers
    Write-Host "✅ Sistema deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Delete failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TESTING COMPLETED ===" -ForegroundColor Green
Write-Host "Please check the results above for any failures." -ForegroundColor Yellow
