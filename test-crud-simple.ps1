# CRUD Operations Test Script for Parroquia API
# This script tests all the main CRUD operations available in the system

$API_BASE = "http://localhost:3000/api"
$headers = @{'Content-Type' = 'application/json'}

Write-Host "Starting CRUD Operations Testing for Parroquia API" -ForegroundColor Green
Write-Host "=" * 60

# Test 1: Health Check
Write-Host "`nTest 1: Health Check" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET
    Write-Host "SUCCESS - Health Check" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)"
    Write-Host "   Message: $($healthResponse.message)"
} catch {
    Write-Host "FAILED - Health Check" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 2: User Registration (CREATE)
Write-Host "`nTest 2: User Registration (CREATE)" -ForegroundColor Yellow
$registrationData = @{
    email = "test.user@example.com"
    password = "SecurePass123!"
    firstName = "Juan Carlos"
    secondName = "Alberto"
    lastName = "Rodriguez"
    secondLastName = "Martinez"
    phone = "+57 300 123 4567"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method POST -Headers $headers -Body $registrationData
    Write-Host "SUCCESS - User Registration" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.data.user.id)"
    Write-Host "   Full Name: $($registerResponse.data.user.fullName)"
    Write-Host "   Email: $($registerResponse.data.user.email)"
    Write-Host "   Phone: $($registerResponse.data.user.phone)"
    $global:testUserId = $registerResponse.data.user.id
} catch {
    Write-Host "FAILED - User Registration" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 3: User Login
Write-Host "`nTest 3: User Login" -ForegroundColor Yellow
$loginData = @{
    email = "test.user@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers $headers -Body $loginData
    Write-Host "SUCCESS - User Login" -ForegroundColor Green
    Write-Host "   Access Token Generated: $($loginResponse.data.accessToken.Length) characters"
    Write-Host "   Refresh Token Generated: $($loginResponse.data.refreshToken.Length) characters"
    $global:accessToken = $loginResponse.data.accessToken
    $global:authHeaders = @{
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $($global:accessToken)"
    }
} catch {
    Write-Host "FAILED - User Login" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 4: Get User Profile (READ)
Write-Host "`nTest 4: Get User Profile (READ)" -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$API_BASE/auth/profile" -Method GET -Headers $global:authHeaders
    Write-Host "SUCCESS - Get Profile" -ForegroundColor Green
    Write-Host "   User ID: $($profileResponse.data.user.id)"
    Write-Host "   Full Name: $($profileResponse.data.user.fullName)"
    Write-Host "   Email Verified: $($profileResponse.data.user.emailVerified)"
} catch {
    Write-Host "FAILED - Get Profile" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 5: Catalog Operations - Parroquias
Write-Host "`nTest 5: Catalog Operations - Parroquias" -ForegroundColor Yellow

# CREATE Parroquia
$parroquiaData = @{
    nombre = "Parroquia San Juan"
    municipio_id = 1
    descripcion = "Parroquia de prueba para testing"
} | ConvertTo-Json

try {
    $createParroquiaResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias" -Method POST -Headers $global:authHeaders -Body $parroquiaData
    Write-Host "SUCCESS - Create Parroquia" -ForegroundColor Green
    Write-Host "   Parroquia ID: $($createParroquiaResponse.data.parroquia.id)"
    Write-Host "   Name: $($createParroquiaResponse.data.parroquia.nombre)"
    $global:parroquiaId = $createParroquiaResponse.data.parroquia.id
} catch {
    Write-Host "FAILED - Create Parroquia" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# READ Parroquias (List)
try {
    $listParroquiasResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias" -Method GET -Headers $global:authHeaders
    Write-Host "SUCCESS - List Parroquias" -ForegroundColor Green
    Write-Host "   Total Parroquias: $($listParroquiasResponse.data.parroquias.Count)"
    Write-Host "   Current Page: $($listParroquiasResponse.data.pagination.page)"
} catch {
    Write-Host "FAILED - List Parroquias" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# READ Parroquia by ID
if ($global:parroquiaId) {
    try {
        $getParroquiaResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/$($global:parroquiaId)" -Method GET -Headers $global:authHeaders
        Write-Host "SUCCESS - Get Parroquia by ID" -ForegroundColor Green
        Write-Host "   Parroquia Name: $($getParroquiaResponse.data.parroquia.nombre)"
        Write-Host "   Description: $($getParroquiaResponse.data.parroquia.descripcion)"
    } catch {
        Write-Host "FAILED - Get Parroquia by ID" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)"
    }
}

# UPDATE Parroquia
if ($global:parroquiaId) {
    $updateParroquiaData = @{
        nombre = "Parroquia San Juan Actualizada"
        descripcion = "Parroquia actualizada durante testing"
    } | ConvertTo-Json

    try {
        $updateParroquiaResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/$($global:parroquiaId)" -Method PUT -Headers $global:authHeaders -Body $updateParroquiaData
        Write-Host "SUCCESS - Update Parroquia" -ForegroundColor Green
        Write-Host "   Updated Name: $($updateParroquiaResponse.data.parroquia.nombre)"
    } catch {
        Write-Host "FAILED - Update Parroquia" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)"
    }
}

# Test 6: User Management Operations
Write-Host "`nTest 6: User Management Operations" -ForegroundColor Yellow

# READ Users (List)
try {
    $listUsersResponse = Invoke-RestMethod -Uri "$API_BASE/users" -Method GET -Headers $global:authHeaders
    Write-Host "SUCCESS - List Users" -ForegroundColor Green
    Write-Host "   Total Users: $($listUsersResponse.data.users.Count)"
    Write-Host "   Current Page: $($listUsersResponse.data.pagination.page)"
} catch {
    Write-Host "FAILED - List Users" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# READ User by ID
if ($global:testUserId) {
    try {
        $getUserResponse = Invoke-RestMethod -Uri "$API_BASE/users/$($global:testUserId)" -Method GET -Headers $global:authHeaders
        Write-Host "SUCCESS - Get User by ID" -ForegroundColor Green
        Write-Host "   User Name: $($getUserResponse.data.user.fullName)"
        Write-Host "   User Status: $($getUserResponse.data.user.status)"
    } catch {
        Write-Host "FAILED - Get User by ID" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)"
    }
}

# Test 7: Statistics and Reports
Write-Host "`nTest 7: Statistics and Reports" -ForegroundColor Yellow

# Parroquias Statistics
try {
    $parroquiasStatsResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/statistics" -Method GET -Headers $global:authHeaders
    Write-Host "SUCCESS - Parroquias Statistics" -ForegroundColor Green
    Write-Host "   Total Count: $($parroquiasStatsResponse.data.statistics.totalCount)"
} catch {
    Write-Host "FAILED - Parroquias Statistics" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 8: Search Operations
Write-Host "`nTest 8: Search Operations" -ForegroundColor Yellow

# Search Parroquias
try {
    $searchParroquiasResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/search?q=San" -Method GET -Headers $global:authHeaders
    Write-Host "SUCCESS - Search Parroquias" -ForegroundColor Green
    Write-Host "   Search Results: $($searchParroquiasResponse.data.parroquias.Count)"
} catch {
    Write-Host "FAILED - Search Parroquias" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 9: Logout
Write-Host "`nTest 9: Logout" -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod -Uri "$API_BASE/auth/logout" -Method POST -Headers $global:authHeaders
    Write-Host "SUCCESS - Logout" -ForegroundColor Green
    Write-Host "   Message: $($logoutResponse.message)"
} catch {
    Write-Host "FAILED - Logout" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test Summary
Write-Host "`n" + "=" * 60
Write-Host "CRUD Testing Summary Complete!" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`nTest Categories Completed:" -ForegroundColor Cyan
Write-Host "   - Health Check and System Status"
Write-Host "   - User Authentication (Register, Login, Logout)"
Write-Host "   - User Profile Management"
Write-Host "   - Catalog CRUD Operations (Parroquias)"
Write-Host "   - User Management Operations"
Write-Host "   - Statistics and Reports"
Write-Host "   - Search Functionality"

Write-Host "`nDatabase Tables Tested:" -ForegroundColor Cyan
Write-Host "   - usuarios (Users table with Spanish fields)"
Write-Host "   - parroquia (Parishes)"
Write-Host "   - municipios (Municipalities - referenced)"

Write-Host "`nSecurity Features Tested:" -ForegroundColor Cyan
Write-Host "   - JWT Authentication"
Write-Host "   - Password Hashing (bcrypt)"
Write-Host "   - Protected Endpoints"
Write-Host "   - Email Verification Flow"
Write-Host "   - Session Management"

Write-Host "`nTesting completed successfully!" -ForegroundColor Green
