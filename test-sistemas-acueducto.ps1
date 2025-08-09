# Test Sistema de Acueducto API
# PowerShell Script for testing Sistema de Acueducto endpoints

$baseUrl = "http://localhost:5000"
$apiEndpoint = "$baseUrl/api/catalog/sistemas-acueducto"

# First, let's get a token (assuming you have an auth endpoint)
Write-Host "========================================" -ForegroundColor Green
Write-Host "Testing Sistema de Acueducto API" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Test 1: Get all sistemas de acueducto
Write-Host "`n1. Testing GET all sistemas de acueducto..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $apiEndpoint -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✓ GET all sistemas successful" -ForegroundColor Green
    Write-Host "Found $($response.data.sistemas.length) sistemas" -ForegroundColor Cyan
    $response.data.sistemas | ForEach-Object { 
        Write-Host "  - ID: $($_.id_sistema_acueducto), Nombre: $($_.nombre)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ GET all sistemas failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get sistema by ID
Write-Host "`n2. Testing GET sistema by ID..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiEndpoint/1" -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✓ GET sistema by ID successful" -ForegroundColor Green
    Write-Host "Sistema: $($response.data.nombre)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ GET sistema by ID failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create new sistema
Write-Host "`n3. Testing POST create new sistema..." -ForegroundColor Yellow
$newSistema = @{
    nombre = "Test PowerShell Sistema"
    descripcion = "Sistema creado desde prueba PowerShell - $(Get-Date)"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $apiEndpoint -Method POST -Body $newSistema -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✓ POST create sistema successful" -ForegroundColor Green
    Write-Host "Created sistema ID: $($response.data.id_sistema_acueducto)" -ForegroundColor Cyan
    $createdId = $response.data.id_sistema_acueducto
} catch {
    Write-Host "✗ POST create sistema failed: $($_.Exception.Message)" -ForegroundColor Red
    $createdId = $null
}

# Test 4: Update sistema (if one was created)
if ($createdId) {
    Write-Host "`n4. Testing PUT update sistema..." -ForegroundColor Yellow
    $updateData = @{
        nombre = "Test PowerShell Sistema Actualizado"
        descripcion = "Sistema actualizado desde prueba PowerShell - $(Get-Date)"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$apiEndpoint/$createdId" -Method PUT -Body $updateData -Headers @{
            "Content-Type" = "application/json"
        }
        Write-Host "✓ PUT update sistema successful" -ForegroundColor Green
        Write-Host "Updated sistema: $($response.data.nombre)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ PUT update sistema failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Search sistemas
Write-Host "`n5. Testing GET search sistemas..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiEndpoint/search?query=agua&page=1&limit=5" -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✓ GET search sistemas successful" -ForegroundColor Green
    Write-Host "Found $($response.data.sistemas.length) sistemas matching 'agua'" -ForegroundColor Cyan
} catch {
    Write-Host "✗ GET search sistemas failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get statistics
Write-Host "`n6. Testing GET statistics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiEndpoint/statistics" -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✓ GET statistics successful" -ForegroundColor Green
    Write-Host "Total sistemas: $($response.data.total)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ GET statistics failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get unique nombres
Write-Host "`n7. Testing GET unique nombres..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiEndpoint/unique/nombres" -Method GET -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✓ GET unique nombres successful" -ForegroundColor Green
    Write-Host "Found $($response.data.length) unique nombres" -ForegroundColor Cyan
} catch {
    Write-Host "✗ GET unique nombres failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Bulk create
Write-Host "`n8. Testing POST bulk create..." -ForegroundColor Yellow
$bulkData = @{
    sistemas = @(
        @{
            nombre = "Bulk Test 1"
            descripcion = "Primer sistema de prueba masiva"
        },
        @{
            nombre = "Bulk Test 2"
            descripcion = "Segundo sistema de prueba masiva"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$apiEndpoint/bulk" -Method POST -Body $bulkData -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✓ POST bulk create successful" -ForegroundColor Green
    Write-Host "Created $($response.data.created.length) sistemas" -ForegroundColor Cyan
    $bulkIds = $response.data.created | ForEach-Object { $_.id_sistema_acueducto }
} catch {
    Write-Host "✗ POST bulk create failed: $($_.Exception.Message)" -ForegroundColor Red
    $bulkIds = @()
}

# Test 9: Test validation (invalid data)
Write-Host "`n9. Testing validation with invalid data..." -ForegroundColor Yellow
$invalidData = @{
    descripcion = "Sistema sin nombre - debe fallar"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $apiEndpoint -Method POST -Body $invalidData -Headers @{
        "Content-Type" = "application/json"
    }
    Write-Host "✗ Validation test failed - should have rejected invalid data" -ForegroundColor Red
} catch {
    Write-Host "✓ Validation working correctly - rejected invalid data" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Cleanup: Delete test sistemas
Write-Host "`n10. Cleanup - Deleting test sistemas..." -ForegroundColor Yellow
$testIds = @()
if ($createdId) { $testIds += $createdId }
$testIds += $bulkIds

foreach ($id in $testIds) {
    try {
        Invoke-RestMethod -Uri "$apiEndpoint/$id" -Method DELETE -Headers @{
            "Content-Type" = "application/json"
        }
        Write-Host "✓ Deleted sistema ID: $id" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to delete sistema ID: $id - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Sistema de Acueducto API Testing Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
