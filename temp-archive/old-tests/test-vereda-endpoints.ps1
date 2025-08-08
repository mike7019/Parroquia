# Test script for Vereda endpoints
# PowerShell script to test all vereda endpoints

# Base URL
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api"

# Colors for output
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"
$warningColor = "Yellow"

# Function to display test results
function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = "",
        [object]$Data = $null
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    if ($Success) {
        Write-Host "[$timestamp] ✓ $TestName" -ForegroundColor $successColor
        if ($Message) { Write-Host "   $Message" -ForegroundColor $infoColor }
    } else {
        Write-Host "[$timestamp] ✗ $TestName" -ForegroundColor $errorColor
        if ($Message) { Write-Host "   $Message" -ForegroundColor $warningColor }
    }
    
    if ($Data -and $Success) {
        Write-Host "   Response: $($Data | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor $infoColor
    }
}

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 3)
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $errorMessage = $_.Exception.Message
        
        try {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorMessage = $errorResponse.message
        }
        catch {
            # If we can't parse the error response, use the original message
        }
        
        return @{ Success = $false; Error = $errorMessage; StatusCode = $statusCode }
    }
}

# Main test function
function Test-VeredaEndpoints {
    Write-Host "`n=== TESTING VEREDA ENDPOINTS ===" -ForegroundColor $infoColor
    Write-Host "Testing Vereda API endpoints..." -ForegroundColor $infoColor
    
    # Test variables
    $token = $null
    $testVeredaId = $null
    $testMunicipioId = 1
    
    # Step 1: Health check
    Write-Host "`n--- Health Check ---" -ForegroundColor $infoColor
    $healthResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/health"
    Write-TestResult -TestName "Health Check" -Success $healthResult.Success -Message $healthResult.Error

    if (-not $healthResult.Success) {
        Write-Host "❌ Application is not running. Please start the server first." -ForegroundColor $errorColor
        return
    }

    # Step 2: Get authentication token
    Write-Host "`n--- Authentication ---" -ForegroundColor $infoColor
    $loginData = @{
        email = "admin@parroquia.com"
        password = "admin123"
    }
    
    $loginResult = Invoke-ApiRequest -Method "POST" -Uri "$apiUrl/auth/login" -Body $loginData
    
    if ($loginResult.Success -and $loginResult.Data.token) {
        $token = $loginResult.Data.token
        Write-TestResult -TestName "Admin Login" -Success $true -Message "Token obtained successfully"
    } else {
        Write-TestResult -TestName "Admin Login" -Success $false -Message $loginResult.Error
        Write-Host "❌ Cannot proceed without authentication token" -ForegroundColor $errorColor
        return
    }

    # Setup headers with token
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    # Step 3: Test GET /api/catalog/veredas (Get all veredas)
    Write-Host "`n--- GET All Veredas ---" -ForegroundColor $infoColor
    $getAllResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas" -Headers $headers
    Write-TestResult -TestName "GET /api/catalog/veredas" -Success $getAllResult.Success -Message $getAllResult.Error -Data $getAllResult.Data

    # Step 4: Test GET with pagination and filters
    Write-Host "`n--- GET Veredas with Pagination ---" -ForegroundColor $infoColor
    $paginationUrl = "$apiUrl/catalog/veredas?page=1" + "&" + "limit=5" + "&" + "sortBy=nombre" + "&" + "sortOrder=ASC"
    $paginationResult = Invoke-ApiRequest -Method "GET" -Uri $paginationUrl -Headers $headers
    Write-TestResult -TestName "GET /api/catalog/veredas (pagination)" -Success $paginationResult.Success -Message $paginationResult.Error -Data $paginationResult.Data

    # Step 5: Test GET veredas by municipio
    Write-Host "`n--- GET Veredas by Municipio ---" -ForegroundColor $infoColor
    $byMunicipioResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas/municipio/$testMunicipioId" -Headers $headers
    Write-TestResult -TestName "GET /api/catalog/veredas/municipio/$testMunicipioId" -Success $byMunicipioResult.Success -Message $byMunicipioResult.Error -Data $byMunicipioResult.Data

    # Step 6: Test GET vereda statistics
    Write-Host "`n--- GET Vereda Statistics ---" -ForegroundColor $infoColor
    $statsResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas/statistics" -Headers $headers
    Write-TestResult -TestName "GET /api/catalog/veredas/statistics" -Success $statsResult.Success -Message $statsResult.Error -Data $statsResult.Data

    # Step 7: Test POST (Create vereda)
    Write-Host "`n--- POST Create Vereda ---" -ForegroundColor $infoColor
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $testVereda = @{
        nombre = "Vereda Test PowerShell $timestamp"
        codigo_vereda = "TEST_PS_$timestamp"
        id_municipio = $testMunicipioId
    }
    
    $createResult = Invoke-ApiRequest -Method "POST" -Uri "$apiUrl/catalog/veredas" -Headers $headers -Body $testVereda
    Write-TestResult -TestName "POST /api/catalog/veredas" -Success $createResult.Success -Message $createResult.Error -Data $createResult.Data

    # Get the created vereda ID for further tests
    if ($createResult.Success) {
        # Try to find the created vereda
        $searchResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas/search?q=Test PowerShell" -Headers $headers
        if ($searchResult.Success -and $searchResult.Data.data -and $searchResult.Data.data.Count -gt 0) {
            $testVeredaId = $searchResult.Data.data[0].id_vereda
            Write-Host "   Created vereda ID: $testVeredaId" -ForegroundColor $infoColor
        }
    }

    # Step 8: Test search functionality
    Write-Host "`n--- GET Search Veredas ---" -ForegroundColor $infoColor
    $searchUrl = "$apiUrl/catalog/veredas/search?q=Test" + "&" + "limit=10"
    $searchTestResult = Invoke-ApiRequest -Method "GET" -Uri $searchUrl -Headers $headers
    Write-TestResult -TestName "GET /api/catalog/veredas/search" -Success $searchTestResult.Success -Message $searchTestResult.Error -Data $searchTestResult.Data

    # Step 9: Test search with municipio filter
    Write-Host "`n--- GET Search Veredas with Municipio Filter ---" -ForegroundColor $infoColor
    $searchMunicipioUrl = "$apiUrl/catalog/veredas/search?q=Test" + "&" + "municipioId=$testMunicipioId" + "&" + "limit=5"
    $searchMunicipioResult = Invoke-ApiRequest -Method "GET" -Uri $searchMunicipioUrl -Headers $headers
    Write-TestResult -TestName "GET /api/catalog/veredas/search (with municipio filter)" -Success $searchMunicipioResult.Success -Message $searchMunicipioResult.Error -Data $searchMunicipioResult.Data

    # Step 10: Test GET specific vereda by ID
    if ($testVeredaId) {
        Write-Host "`n--- GET Vereda by ID ---" -ForegroundColor $infoColor
        $getByIdResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas/$testVeredaId" -Headers $headers
        Write-TestResult -TestName "GET /api/catalog/veredas/$testVeredaId" -Success $getByIdResult.Success -Message $getByIdResult.Error -Data $getByIdResult.Data

        # Step 11: Test GET vereda details
        Write-Host "`n--- GET Vereda Details ---" -ForegroundColor $infoColor
        $getDetailsResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas/$testVeredaId/details" -Headers $headers
        Write-TestResult -TestName "GET /api/catalog/veredas/$testVeredaId/details" -Success $getDetailsResult.Success -Message $getDetailsResult.Error -Data $getDetailsResult.Data

        # Step 12: Test PUT (Update vereda)
        Write-Host "`n--- PUT Update Vereda ---" -ForegroundColor $infoColor
        $updateData = @{
            nombre = "Vereda Test PowerShell Updated $timestamp"
            codigo_vereda = "TEST_PS_UPD_$timestamp"
        }
        
        $updateResult = Invoke-ApiRequest -Method "PUT" -Uri "$apiUrl/catalog/veredas/$testVeredaId" -Headers $headers -Body $updateData
        Write-TestResult -TestName "PUT /api/catalog/veredas/$testVeredaId" -Success $updateResult.Success -Message $updateResult.Error -Data $updateResult.Data

        # Step 13: Test DELETE vereda
        Write-Host "`n--- DELETE Vereda ---" -ForegroundColor $infoColor
        $deleteResult = Invoke-ApiRequest -Method "DELETE" -Uri "$apiUrl/catalog/veredas/$testVeredaId" -Headers $headers
        Write-TestResult -TestName "DELETE /api/catalog/veredas/$testVeredaId" -Success $deleteResult.Success -Message $deleteResult.Error -Data $deleteResult.Data
    } else {
        Write-Host "`n--- Skipping ID-based tests ---" -ForegroundColor $warningColor
        Write-Host "Could not obtain test vereda ID, skipping GET by ID, Update, and Delete tests" -ForegroundColor $warningColor
    }

    # Step 14: Test error cases
    Write-Host "`n--- Error Cases ---" -ForegroundColor $infoColor
    
    # Test invalid search (too short)
    $invalidSearchResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas/search?q=a" -Headers $headers
    $expectedError = $invalidSearchResult.StatusCode -eq 400
    Write-TestResult -TestName "Invalid search (too short)" -Success $expectedError -Message $(if ($expectedError) { "Correctly returned 400 error" } else { "Should have returned 400 error" })

    # Test GET non-existent vereda
    $nonExistentResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas/99999" -Headers $headers
    $expectedNotFound = $nonExistentResult.StatusCode -eq 404
    Write-TestResult -TestName "GET non-existent vereda" -Success $expectedNotFound -Message $(if ($expectedNotFound) { "Correctly returned 404 error" } else { "Should have returned 404 error" })

    # Test POST without required data
    $invalidCreateResult = Invoke-ApiRequest -Method "POST" -Uri "$apiUrl/catalog/veredas" -Headers $headers -Body @{}
    $expectedValidationError = $invalidCreateResult.StatusCode -eq 400
    Write-TestResult -TestName "Create vereda without required data" -Success $expectedValidationError -Message $(if ($expectedValidationError) { "Correctly returned 400 error" } else { "Should have returned 400 error" })

    Write-Host "`n=== VEREDA ENDPOINTS TEST COMPLETED ===" -ForegroundColor $infoColor
}

# Test endpoints without authentication (should fail)
function Test-VeredaEndpointsWithoutAuth {
    Write-Host "`n=== TESTING VEREDA ENDPOINTS WITHOUT AUTHENTICATION ===" -ForegroundColor $infoColor
    
    $noAuthResult = Invoke-ApiRequest -Method "GET" -Uri "$apiUrl/catalog/veredas"
    $expectedUnauth = $noAuthResult.StatusCode -eq 401 -or $noAuthResult.StatusCode -eq 403
    Write-TestResult -TestName "GET /api/catalog/veredas (no auth)" -Success $expectedUnauth -Message $(if ($expectedUnauth) { "Correctly returned authentication error" } else { "Should require authentication" })
}

# Run the tests
Write-Host "🚀 Starting Vereda Endpoints Tests..." -ForegroundColor $infoColor
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor $infoColor

# Test without authentication first
Test-VeredaEndpointsWithoutAuth

# Then test with authentication
Test-VeredaEndpoints

Write-Host "`n✅ All tests completed!" -ForegroundColor $successColor
Write-Host "Check the results above for any failed tests." -ForegroundColor $infoColor
