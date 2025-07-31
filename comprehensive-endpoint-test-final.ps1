Write-Host "=== COMPREHENSIVE API ENDPOINT TESTING ===" -ForegroundColor Cyan
Write-Host "Testing all available endpoints in Parroquia API" -ForegroundColor Gray
Write-Host ("=" * 60) -ForegroundColor Gray

$baseUrl = "http://localhost:3000"
$results = @()

# Function to test endpoint
function Test-APIEndpoint {
    param($Method, $Endpoint, $Headers = @{}, $Body = $null, $Description)
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
        }
        if ($Body) { $params.Body = $Body; $params.ContentType = "application/json" }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ $Description" -ForegroundColor Green
        return @{ Status = "PASS"; Description = $Description; Endpoint = "$Method $Endpoint" }
    }
    catch {
        $error = $_.Exception.Message
        Write-Host "❌ $Description - $error" -ForegroundColor Red
        return @{ Status = "FAIL"; Description = $Description; Endpoint = "$Method $Endpoint"; Error = $error }
    }
}

# Step 1: Test System Endpoints (No Auth Required)
Write-Host "`n1. SYSTEM ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/health" -Description "Health Check"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/status" -Description "System Status"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/cors-test" -Description "CORS Test"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/ip-test" -Description "IP Detection Test"

# Step 2: Authentication Endpoints
Write-Host "`n2. AUTHENTICATION ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

# Login to get authentication token
$loginBody = @{
    email = "testauth@example.com"
    password = "TestAuth123!"
} | ConvertTo-Json

$loginResult = Test-APIEndpoint -Method "POST" -Endpoint "/api/auth/login" -Body $loginBody -Description "User Login"
$results += $loginResult

# Extract token if login successful
$authHeaders = @{}
if ($loginResult.Status -eq "PASS") {
    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
        $token = $loginResponse.data.accessToken
        $authHeaders = @{ "Authorization" = "Bearer $token" }
        Write-Host "   📝 Authentication token obtained" -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️ Could not extract authentication token" -ForegroundColor Yellow
    }
}

# Test other auth endpoints
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/auth/profile" -Headers $authHeaders -Description "Get User Profile"

$forgotPasswordBody = @{ email = "testauth@example.com" } | ConvertTo-Json
$results += Test-APIEndpoint -Method "POST" -Endpoint "/api/auth/forgot-password" -Body $forgotPasswordBody -Description "Forgot Password"

$resendVerificationBody = @{ email = "testauth@example.com" } | ConvertTo-Json
$results += Test-APIEndpoint -Method "POST" -Endpoint "/api/auth/resend-verification-public" -Body $resendVerificationBody -Description "Resend Verification (Public)"

$results += Test-APIEndpoint -Method "POST" -Endpoint "/api/auth/resend-verification" -Headers $authHeaders -Description "Resend Verification (Auth)"

# Step 3: User Management Endpoints  
Write-Host "`n3. USER MANAGEMENT ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/users" -Headers $authHeaders -Description "List All Users"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/users/deleted" -Headers $authHeaders -Description "List Deleted Users"

# Step 4: Catalog Endpoints
Write-Host "`n4. CATALOG ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/catalog/health" -Description "Catalog Health Check"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/catalog/parroquias" -Headers $authHeaders -Description "Parroquias Catalog"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/catalog/veredas" -Headers $authHeaders -Description "Veredas Catalog"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/catalog/sexos" -Headers $authHeaders -Description "Sexos Catalog"

# Step 5: Documentation Endpoints
Write-Host "`n5. DOCUMENTATION ENDPOINTS" -ForegroundColor Yellow  
Write-Host ("-" * 30) -ForegroundColor Gray

$results += Test-APIEndpoint -Method "GET" -Endpoint "/api-docs" -Description "Swagger UI"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api-docs-custom" -Description "Custom API Documentation"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/sector-schema" -Description "Sector Schema"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/swagger-debug" -Description "Swagger Debug Info"

# Step 6: HTML Pages
Write-Host "`n6. HTML VERIFICATION PAGES" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/verify-email?token=test-token" -Description "Email Verification Page"
$results += Test-APIEndpoint -Method "GET" -Endpoint "/api/reset-password?token=test-token" -Description "Password Reset Page"

# Step 7: Password Management  
Write-Host "`n7. PASSWORD MANAGEMENT" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

$changePasswordBody = @{
    currentPassword = "TestAuth123!"
    newPassword = "NewTestAuth123!"
} | ConvertTo-Json

$results += Test-APIEndpoint -Method "POST" -Endpoint "/api/auth/change-password" -Headers $authHeaders -Body $changePasswordBody -Description "Change Password"

# Revert password change
$revertPasswordBody = @{
    currentPassword = "NewTestAuth123!"
    newPassword = "TestAuth123!"
} | ConvertTo-Json

Test-APIEndpoint -Method "POST" -Endpoint "/api/auth/change-password" -Headers $authHeaders -Body $revertPasswordBody -Description "Revert Password Change" | Out-Null

# Step 8: Session Management
Write-Host "`n8. SESSION MANAGEMENT" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

$results += Test-APIEndpoint -Method "POST" -Endpoint "/api/auth/logout" -Headers $authHeaders -Description "User Logout"

# Final Results
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "🎯 COMPREHENSIVE ENDPOINT TEST RESULTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

$totalTests = $results.Count
$passedTests = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = $totalTests - $passedTests
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "`n📊 SUMMARY STATISTICS:" -ForegroundColor White
Write-Host "   Total Endpoints Tested: $totalTests" -ForegroundColor Gray
Write-Host "   Successful Tests: $passedTests" -ForegroundColor Green
Write-Host "   Failed Tests: $failedTests" -ForegroundColor Red
Write-Host "   Success Rate: $successRate%" -ForegroundColor Cyan

Write-Host "`n📋 DETAILED RESULTS BY CATEGORY:" -ForegroundColor White

# Group results by category
$categories = @{
    "System" = ($results | Where-Object { $_.Endpoint -like "*health*" -or $_.Endpoint -like "*status*" -or $_.Endpoint -like "*cors*" -or $_.Endpoint -like "*ip*" })
    "Authentication" = ($results | Where-Object { $_.Endpoint -like "*auth*" })
    "User Management" = ($results | Where-Object { $_.Endpoint -like "*users*" })
    "Catalog" = ($results | Where-Object { $_.Endpoint -like "*catalog*" })
    "Documentation" = ($results | Where-Object { $_.Endpoint -like "*docs*" -or $_.Endpoint -like "*swagger*" -or $_.Endpoint -like "*schema*" })
    "HTML Pages" = ($results | Where-Object { $_.Endpoint -like "*verify*" -or $_.Endpoint -like "*reset*" })
}

foreach ($category in $categories.Keys) {
    $categoryResults = $categories[$category]
    if ($categoryResults.Count -gt 0) {
        $categoryPassed = ($categoryResults | Where-Object { $_.Status -eq "PASS" }).Count
        $categoryTotal = $categoryResults.Count
        Write-Host "`n$category ($categoryPassed/$categoryTotal):" -ForegroundColor Yellow
        
        $categoryResults | ForEach-Object {
            $color = if ($_.Status -eq "PASS") { "Green" } else { "Red" }
            $icon = if ($_.Status -eq "PASS") { "✅" } else { "❌" }
            Write-Host "   $icon $($_.Description)" -ForegroundColor $color
        }
    }
}

Write-Host "`n🏁 COMPREHENSIVE ENDPOINT TESTING COMPLETED!" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
