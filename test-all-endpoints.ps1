Write-Host "=== COMPREHENSIVE ENDPOINT TESTING ===" -ForegroundColor Cyan
$baseUrl = "http://localhost:3000"
$testResults = @()

function Test-Endpoint($Method, $Url, $Headers = @{}, $Body = $null, $Description) {
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
        Write-Host "❌ $Description - $errorMsg" -ForegroundColor Red
        return @{ Status = "FAILED"; Response = $null; Error = $errorMsg }
    }
}

$global:accessToken = $null
$global:authHeaders = @{}

Write-Host "`n1. SYSTEM ENDPOINTS" -ForegroundColor Yellow

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/health" -Description "Health Check"
$testResults += @{ Endpoint = "GET /api/health"; Result = $result.Status }

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/status" -Description "System Status"
$testResults += @{ Endpoint = "GET /api/status"; Result = $result.Status }

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/cors-test" -Description "CORS Test"
$testResults += @{ Endpoint = "GET /api/cors-test"; Result = $result.Status }

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/ip-test" -Description "IP Test"
$testResults += @{ Endpoint = "GET /api/ip-test"; Result = $result.Status }

Write-Host "`n2. AUTHENTICATION ENDPOINTS" -ForegroundColor Yellow

$loginData = @{
    email = "testauth@example.com"
    password = "TestAuth123!"
} | ConvertTo-Json

$result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginData -Description "User Login"
$testResults += @{ Endpoint = "POST /api/auth/login"; Result = $result.Status }

if ($result.Status -eq "SUCCESS") {
    $global:accessToken = $result.Response.data.accessToken
    $global:authHeaders = @{ "Authorization" = "Bearer $global:accessToken" }
    Write-Host "   📝 Authentication token obtained" -ForegroundColor Gray
}

if ($global:accessToken) {
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/auth/profile" -Headers $global:authHeaders -Description "Get Profile"
    $testResults += @{ Endpoint = "GET /api/auth/profile"; Result = $result.Status }
}

$forgotPasswordData = @{ email = "testauth@example.com" } | ConvertTo-Json
$result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/forgot-password" -Body $forgotPasswordData -Description "Forgot Password"
$testResults += @{ Endpoint = "POST /api/auth/forgot-password"; Result = $result.Status }

Write-Host "`n3. USER MANAGEMENT ENDPOINTS" -ForegroundColor Yellow

if ($global:accessToken) {
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/users" -Headers $global:authHeaders -Description "List Users"
    $testResults += @{ Endpoint = "GET /api/users"; Result = $result.Status }
    
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/users/deleted" -Headers $global:authHeaders -Description "List Deleted Users"
    $testResults += @{ Endpoint = "GET /api/users/deleted"; Result = $result.Status }
}

Write-Host "`n4. CATALOG ENDPOINTS" -ForegroundColor Yellow

$catalogs = @("parroquias", "veredas", "municipios", "sexo", "estado-civil")

foreach ($catalog in $catalogs) {
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/catalog/$catalog" -Description "GET $catalog"
    $testResults += @{ Endpoint = "GET /api/catalog/$catalog"; Result = $result.Status }
    
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/catalog/$catalog/search?q=test" -Description "Search $catalog"
    $testResults += @{ Endpoint = "GET /api/catalog/$catalog/search"; Result = $result.Status }
    
    $result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/catalog/$catalog/statistics" -Description "Statistics $catalog"
    $testResults += @{ Endpoint = "GET /api/catalog/$catalog/statistics"; Result = $result.Status }
}

Write-Host "`n5. DOCUMENTATION ENDPOINTS" -ForegroundColor Yellow

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api-docs" -Description "Swagger UI"
$testResults += @{ Endpoint = "GET /api-docs"; Result = $result.Status }

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/swagger-debug" -Description "Swagger Debug"
$testResults += @{ Endpoint = "GET /api/swagger-debug"; Result = $result.Status }

Write-Host "`n6. HTML PAGES" -ForegroundColor Yellow

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/verify-email?token=test" -Description "Email Verification Page"
$testResults += @{ Endpoint = "GET /api/verify-email"; Result = $result.Status }

$result = Test-Endpoint -Method "GET" -Url "$baseUrl/api/reset-password?token=test" -Description "Password Reset Page"
$testResults += @{ Endpoint = "GET /api/reset-password"; Result = $result.Status }

Write-Host "`n7. LOGOUT" -ForegroundColor Yellow

if ($global:accessToken) {
    $result = Test-Endpoint -Method "POST" -Url "$baseUrl/api/auth/logout" -Headers $global:authHeaders -Description "Logout"
    $testResults += @{ Endpoint = "POST /api/auth/logout"; Result = $result.Status }
}

Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
Write-Host "🎯 TEST RESULTS SUMMARY" -ForegroundColor Cyan

$totalEndpoints = $testResults.Count
$successCount = ($testResults | Where-Object { $_.Result -eq "SUCCESS" }).Count
$failureCount = $totalEndpoints - $successCount

Write-Host "`n📊 SUMMARY:" -ForegroundColor White
Write-Host "   Total Endpoints: $totalEndpoints" -ForegroundColor Gray
Write-Host "   Successful: $successCount" -ForegroundColor Green  
Write-Host "   Failed: $failureCount" -ForegroundColor Red

$successRate = [math]::Round(($successCount / $totalEndpoints) * 100, 1)
Write-Host "   Success Rate: $successRate%" -ForegroundColor Cyan

Write-Host "`n📋 RESULTS:" -ForegroundColor White
$testResults | ForEach-Object {
    $color = if ($_.Result -eq "SUCCESS") { "Green" } else { "Red" }
    $icon = if ($_.Result -eq "SUCCESS") { "✅" } else { "❌" }
    Write-Host "   $icon $($_.Endpoint)" -ForegroundColor $color
}

Write-Host "`n🏁 ENDPOINT TESTING COMPLETED!" -ForegroundColor Cyan
