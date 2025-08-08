# Test script for Vereda endpoints - PowerShell compatible
# Script to test all vereda endpoints

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$apiUrl = "$BaseUrl/api"
$veredaUrl = "$apiUrl/catalog/veredas"

# Function to make HTTP requests
function Invoke-SafeApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $requestParams = @{
            Method = $Method
            Uri = $Uri
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $requestParams.Body = ($Body | ConvertTo-Json -Depth 3)
        }
        
        $response = Invoke-RestMethod @requestParams
        return @{ Success = $true; Data = $response; Error = $null }
    }
    catch {
        return @{ Success = $false; Data = $null; Error = $_.Exception.Message }
    }
}

# Function to display results
function Show-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = ""
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    if ($Success) {
        Write-Host "[$timestamp] SUCCESS: $TestName" -ForegroundColor Green
    } else {
        Write-Host "[$timestamp] FAILED: $TestName" -ForegroundColor Red
        if ($Message) {
            Write-Host "  Error: $Message" -ForegroundColor Yellow
        }
    }
}

Write-Host "=== TESTING VEREDA ENDPOINTS ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "API URL: $apiUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Health check
Write-Host "1. Testing Health Check..." -ForegroundColor Cyan
$healthResult = Invoke-SafeApiRequest -Method "GET" -Uri "$BaseUrl/health"
Show-TestResult -TestName "Health Check" -Success $healthResult.Success -Message $healthResult.Error

if (-not $healthResult.Success) {
    Write-Host "Application is not running. Exiting tests." -ForegroundColor Red
    exit 1
}

# Test 2: Login to get token
Write-Host "`n2. Testing Authentication..." -ForegroundColor Cyan
$loginData = @{
    correo_electronico = "dieg45475105@yopmail.com"
    contrasena = "Fuerte789&"
}

$loginResult = Invoke-SafeApiRequest -Method "POST" -Uri "$apiUrl/auth/login" -Body $loginData
Show-TestResult -TestName "Admin Login" -Success $loginResult.Success -Message $loginResult.Error

if (-not $loginResult.Success -or -not $loginResult.Data.data.accessToken) {
    Write-Host "Cannot get authentication token. Exiting tests." -ForegroundColor Red
    if ($loginResult.Data) {
        Write-Host "Response data: $($loginResult.Data | ConvertTo-Json -Depth 2)" -ForegroundColor Yellow
    }
    exit 1
}

$token = $loginResult.Data.data.accessToken
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "Token obtained successfully!" -ForegroundColor Green

# Test 3: GET all veredas
Write-Host "`n3. Testing GET All Veredas..." -ForegroundColor Cyan
$getAllResult = Invoke-SafeApiRequest -Method "GET" -Uri $veredaUrl -Headers $headers
Show-TestResult -TestName "GET /api/catalog/veredas" -Success $getAllResult.Success -Message $getAllResult.Error

if ($getAllResult.Success) {
    $count = if ($getAllResult.Data.data) { $getAllResult.Data.data.Count } else { 0 }
    Write-Host "  Found $count veredas" -ForegroundColor Gray
}

# Test 4: GET with pagination
Write-Host "`n4. Testing GET with Pagination..." -ForegroundColor Cyan
$paginationUrl = $veredaUrl + "?page=1" + [char]38 + "limit=5"
$paginationResult = Invoke-SafeApiRequest -Method "GET" -Uri $paginationUrl -Headers $headers
Show-TestResult -TestName "GET with pagination" -Success $paginationResult.Success -Message $paginationResult.Error

# Test 5: GET veredas by municipio
Write-Host "`n5. Testing GET Veredas by Municipio..." -ForegroundColor Cyan
$municipioUrl = $veredaUrl + "/municipio/1"
$municipioResult = Invoke-SafeApiRequest -Method "GET" -Uri $municipioUrl -Headers $headers
Show-TestResult -TestName "GET by municipio" -Success $municipioResult.Success -Message $municipioResult.Error

# Test 6: GET vereda statistics
Write-Host "`n6. Testing GET Vereda Statistics..." -ForegroundColor Cyan
$statsUrl = $veredaUrl + "/statistics"
$statsResult = Invoke-SafeApiRequest -Method "GET" -Uri $statsUrl -Headers $headers
Show-TestResult -TestName "GET statistics" -Success $statsResult.Success -Message $statsResult.Error

# Test 7: Search veredas
Write-Host "`n7. Testing Search Veredas..." -ForegroundColor Cyan
$searchUrl = $veredaUrl + "/search?q=test"
$searchResult = Invoke-SafeApiRequest -Method "GET" -Uri $searchUrl -Headers $headers
Show-TestResult -TestName "Search veredas" -Success $searchResult.Success -Message $searchResult.Error

# Test 8: Create vereda
Write-Host "`n8. Testing POST Create Vereda..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$newVereda = @{
    nombre = "Vereda Test PS $timestamp"
    codigo_vereda = "TEST_PS_$timestamp"
    id_municipio = 1
}

$createResult = Invoke-SafeApiRequest -Method "POST" -Uri $veredaUrl -Headers $headers -Body $newVereda
Show-TestResult -TestName "POST create vereda" -Success $createResult.Success -Message $createResult.Error

$testVeredaId = $null
if ($createResult.Success) {
    Write-Host "  Vereda created successfully!" -ForegroundColor Gray
    
    # Try to find the created vereda by searching
    $findUrl = $veredaUrl + "/search?q=Test PS"
    $findResult = Invoke-SafeApiRequest -Method "GET" -Uri $findUrl -Headers $headers
    if ($findResult.Success -and $findResult.Data.data -and $findResult.Data.data.Count -gt 0) {
        $testVeredaId = $findResult.Data.data[0].id_vereda
        Write-Host "  Found created vereda with ID: $testVeredaId" -ForegroundColor Gray
    }
}

# Test 9: GET specific vereda by ID
if ($testVeredaId) {
    Write-Host "`n9. Testing GET Vereda by ID..." -ForegroundColor Cyan
    $getByIdUrl = $veredaUrl + "/$testVeredaId"
    $getByIdResult = Invoke-SafeApiRequest -Method "GET" -Uri $getByIdUrl -Headers $headers
    Show-TestResult -TestName "GET by ID" -Success $getByIdResult.Success -Message $getByIdResult.Error

    # Test 10: GET vereda details
    Write-Host "`n10. Testing GET Vereda Details..." -ForegroundColor Cyan
    $detailsUrl = $veredaUrl + "/$testVeredaId/details"
    $detailsResult = Invoke-SafeApiRequest -Method "GET" -Uri $detailsUrl -Headers $headers
    Show-TestResult -TestName "GET details" -Success $detailsResult.Success -Message $detailsResult.Error

    # Test 11: Update vereda
    Write-Host "`n11. Testing PUT Update Vereda..." -ForegroundColor Cyan
    $updateData = @{
        nombre = "Vereda Test PS Updated $timestamp"
    }
    
    $updateUrl = $veredaUrl + "/$testVeredaId"
    $updateResult = Invoke-SafeApiRequest -Method "PUT" -Uri $updateUrl -Headers $headers -Body $updateData
    Show-TestResult -TestName "PUT update vereda" -Success $updateResult.Success -Message $updateResult.Error

    # Test 12: Delete vereda
    Write-Host "`n12. Testing DELETE Vereda..." -ForegroundColor Cyan
    $deleteUrl = $veredaUrl + "/$testVeredaId"
    $deleteResult = Invoke-SafeApiRequest -Method "DELETE" -Uri $deleteUrl -Headers $headers
    Show-TestResult -TestName "DELETE vereda" -Success $deleteResult.Success -Message $deleteResult.Error
} else {
    Write-Host "`n9-12. Skipping ID-based tests (no test vereda ID)" -ForegroundColor Yellow
}

# Test 13: Error cases
Write-Host "`n13. Testing Error Cases..." -ForegroundColor Cyan

# Test invalid search (too short)
$invalidSearchUrl = $veredaUrl + "/search?q=a"
$invalidSearchResult = Invoke-SafeApiRequest -Method "GET" -Uri $invalidSearchUrl -Headers $headers
$shouldFail = -not $invalidSearchResult.Success
Show-TestResult -TestName "Invalid search (should fail)" -Success $shouldFail -Message $(if($shouldFail){"Correctly rejected"}else{"Should have failed"})

# Test GET non-existent vereda
$nonExistentUrl = $veredaUrl + "/99999"
$nonExistentResult = Invoke-SafeApiRequest -Method "GET" -Uri $nonExistentUrl -Headers $headers
$shouldFail2 = -not $nonExistentResult.Success
Show-TestResult -TestName "GET non-existent vereda (should fail)" -Success $shouldFail2 -Message $(if($shouldFail2){"Correctly returned error"}else{"Should have failed"})

# Test without authentication
Write-Host "`n14. Testing Without Authentication..." -ForegroundColor Cyan
$noAuthResult = Invoke-SafeApiRequest -Method "GET" -Uri $veredaUrl
$shouldFail3 = -not $noAuthResult.Success
Show-TestResult -TestName "GET without auth (should fail)" -Success $shouldFail3 -Message $(if($shouldFail3){"Correctly requires auth"}else{"Should require auth"})

Write-Host "`n=== VEREDA ENDPOINTS TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host "All tests finished!" -ForegroundColor Green
