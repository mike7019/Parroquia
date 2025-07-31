# ===================================================================
# COMPREHENSIVE ENDPOINT TESTING SCRIPT
# Tests all available endpoints in the Parroquia API
# ===================================================================

Write-Host "=== COMPREHENSIVE ENDPOINT TESTING ===" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Gray

$baseUrl = "http://localhost:3000"
$testResults = @()

# Function to make API request with error handling
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Description
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ $Description" -ForegroundColor Green
        return @{ Status = "SUCCESS"; Response = $response; Error = $null }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "❌ $Description - HTTP $statusCode" -ForegroundColor Red
        } else {
            Write-Host "❌ $Description - $errorMsg" -ForegroundColor Red
        }
        return @{ Status = "FAILED"; Response = $null; Error = $errorMsg }
    }
}

# Global variables for authentication
$global:accessToken = $null
$global:refreshToken = $null
$global:testUserId = $null
$global:authHeaders = @{}

Write-Host "`n1. SYSTEM ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

# Health Check
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/health" -Description "Health Check"
$testResults += @{ Endpoint = "GET /api/health"; Result = $result.Status }

# System Status  
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/status" -Description "System Status"
$testResults += @{ Endpoint = "GET /api/status"; Result = $result.Status }

# CORS Test
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/cors-test" -Description "CORS Test"
$testResults += @{ Endpoint = "GET /api/cors-test"; Result = $result.Status }

# IP Test
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/ip-test" -Description "IP Detection Test"
$testResults += @{ Endpoint = "GET /api/ip-test"; Result = $result.Status }

Write-Host "`n2. AUTHENTICATION ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

# Use existing verified user for login
$loginData = @{
    email = "testauth@example.com"
    password = "TestAuth123!"
} | ConvertTo-Json

$result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginData -Description "User Login"
$testResults += @{ Endpoint = "POST /api/auth/login"; Result = $result.Status }

if ($result.Status -eq "SUCCESS" -and $result.Response) {
    $global:accessToken = $result.Response.data.accessToken
    $global:refreshToken = $result.Response.data.refreshToken
    $global:testUserId = $result.Response.data.user.id
    $global:authHeaders = @{ "Authorization" = "Bearer $global:accessToken" }
    Write-Host "   📝 Authentication tokens obtained" -ForegroundColor Gray
}

# Get Profile (requires authentication)
if ($global:accessToken) {
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/auth/profile" -Headers $global:authHeaders -Description "Get User Profile"
    $testResults += @{ Endpoint = "GET /api/auth/profile"; Result = $result.Status }
}

# Refresh Token
if ($global:refreshToken) {
    $refreshData = @{ refreshToken = $global:refreshToken } | ConvertTo-Json
    $result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/refresh-token" -Body $refreshData -Description "Refresh Token"
    $testResults += @{ Endpoint = "POST /api/auth/refresh-token"; Result = $result.Status }
}

# Change Password (requires authentication)
if ($global:accessToken) {
    $changePasswordData = @{
        currentPassword = "TestAuth123!"
        newPassword = "NewTestAuth123!"
    } | ConvertTo-Json
    
    $result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/change-password" -Headers $global:authHeaders -Body $changePasswordData -Description "Change Password"
    $testResults += @{ Endpoint = "POST /api/auth/change-password"; Result = $result.Status }
    
    # Change it back
    $revertPasswordData = @{
        currentPassword = "NewTestAuth123!"
        newPassword = "TestAuth123!"
    } | ConvertTo-Json
    
    Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/change-password" -Headers $global:authHeaders -Body $revertPasswordData -Description "Revert Password" | Out-Null
}

# Forgot Password
$forgotPasswordData = @{ email = "testauth@example.com" } | ConvertTo-Json
$result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/forgot-password" -Body $forgotPasswordData -Description "Forgot Password"
$testResults += @{ Endpoint = "POST /api/auth/forgot-password"; Result = $result.Status }

# Resend Verification (public)
$resendData = @{ email = "testauth@example.com" } | ConvertTo-Json
$result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/resend-verification-public" -Body $resendData -Description "Resend Verification (Public)"
$testResults += @{ Endpoint = "POST /api/auth/resend-verification-public"; Result = $result.Status }

# Resend Verification (authenticated)
if ($global:accessToken) {
    $result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/resend-verification" -Headers $global:authHeaders -Description "Resend Verification (Auth)"
    $testResults += @{ Endpoint = "POST /api/auth/resend-verification"; Result = $result.Status }
}

Write-Host "`n3. USER MANAGEMENT ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

if ($global:accessToken) {
    # List Users
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/users" -Headers $global:authHeaders -Description "List Users"
    $testResults += @{ Endpoint = "GET /api/users"; Result = $result.Status }
    
    # Get User by ID
    if ($global:testUserId) {
        $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/users/$global:testUserId" -Headers $global:authHeaders -Description "Get User by ID"
        $testResults += @{ Endpoint = "GET /api/users/{id}"; Result = $result.Status }
        
        # Update User
        $updateUserData = @{
            firstName = "UpdatedTest"
            lastName = "UpdatedUser"
            phone = "+57 300 999 9999"
        } | ConvertTo-Json
        
        $result = Test-Endpoint -Method "PUT" -Url "$baseUrl/api/users/$global:testUserId" -Headers $global:authHeaders -Body $updateUserData -Description "Update User"
        $testResults += @{ Endpoint = "PUT /api/users/{id}"; Result = $result.Status }
    }
    
    # List Deleted Users
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/users/deleted" -Headers $global:authHeaders -Description "List Deleted Users"
    $testResults += @{ Endpoint = "GET /api/users/deleted"; Result = $result.Status }
}

Write-Host "`n4. CATALOG ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

# List of main catalog endpoints to test
$catalogEndpoints = @(
    "parroquias",
    "veredas", 
    "municipios",
    "sexo",
    "estado-civil",
    "niveles-educativos",
    "parentesco",
    "roles"
)

foreach ($catalog in $catalogEndpoints) {
    # GET catalog items
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/catalog/$catalog" -Description "GET $catalog"
    $testResults += @{ Endpoint = "GET /api/catalog/$catalog"; Result = $result.Status }
    
    # Search in catalog
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/catalog/$catalog/search?q=test" -Description "Search $catalog"
    $testResults += @{ Endpoint = "GET /api/catalog/$catalog/search"; Result = $result.Status }
    
    # Statistics for catalog
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/catalog/$catalog/statistics" -Description "Statistics $catalog"
    $testResults += @{ Endpoint = "GET /api/catalog/$catalog/statistics"; Result = $result.Status }
}

Write-Host "`n5. SWAGGER AND DOCUMENTATION ENDPOINTS" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

# Swagger UI
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api-docs" -Description "Swagger UI"
$testResults += @{ Endpoint = "GET /api-docs"; Result = $result.Status }

# Custom API Docs
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api-docs-custom" -Description "Custom API Docs"
$testResults += @{ Endpoint = "GET /api-docs-custom"; Result = $result.Status }

# Swagger Debug
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/swagger-debug" -Description "Swagger Debug"
$testResults += @{ Endpoint = "GET /api/swagger-debug"; Result = $result.Status }

Write-Host "`n6. EMAIL VERIFICATION AND PASSWORD RESET PAGES" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

# Email Verification Page
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/verify-email?token=test" -Description "Email Verification Page"
$testResults += @{ Endpoint = "GET /api/verify-email"; Result = $result.Status }

# Password Reset Page  
$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/reset-password?token=test" -Description "Password Reset Page"
$testResults += @{ Endpoint = "GET /api/reset-password"; Result = $result.Status }

Write-Host "`n7. LOGOUT (Final Cleanup)" -ForegroundColor Yellow
Write-Host ("-" * 30) -ForegroundColor Gray

# Logout
if ($global:accessToken) {
    $result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/logout" -Headers $global:authHeaders -Description "User Logout"
    $testResults += @{ Endpoint = "POST /api/auth/logout"; Result = $result.Status }
}

Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
Write-Host "🎯 COMPREHENSIVE ENDPOINT TEST RESULTS" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Gray

# Count results
$totalEndpoints = $testResults.Count
$successCount = ($testResults | Where-Object { $_.Result -eq "SUCCESS" }).Count
$failureCount = $totalEndpoints - $successCount

Write-Host "`n📊 SUMMARY:" -ForegroundColor White
Write-Host "   Total Endpoints Tested: $totalEndpoints" -ForegroundColor Gray
Write-Host "   Successful: $successCount" -ForegroundColor Green  
Write-Host "   Failed: $failureCount" -ForegroundColor Red
Write-Host "   Success Rate: $([math]::Round(($successCount / $totalEndpoints) * 100, 1))%" -ForegroundColor Cyan

Write-Host "`n📋 DETAILED RESULTS:" -ForegroundColor White
$testResults | ForEach-Object {
    $color = if ($_.Result -eq "SUCCESS") { "Green" } else { "Red" }
    $icon = if ($_.Result -eq "SUCCESS") { "✅" } else { "❌" }
    Write-Host "   $icon $($_.Endpoint)" -ForegroundColor $color
}

Write-Host "`n🏁 COMPREHENSIVE ENDPOINT TESTING COMPLETED!" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Gray
