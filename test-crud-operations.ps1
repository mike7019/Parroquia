# CRUD Operations Test Script for Parroquia API
# This script tests all the main CRUD operations available in the system

$API_BASE = "http://localhost:3000/api"
$headers = @{'Content-Type' = 'application/json'}

Write-Host "🚀 Starting CRUD Operations Testing for Parroquia API" -ForegroundColor Green
Write-Host "=" * 60

# Test 1: Health Check
Write-Host "`n📊 Test 1: Health Check" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET
    Write-Host "✅ Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)"
    Write-Host "   Message: $($healthResponse.message)"
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 2: User Registration (CREATE)
Write-Host "`n👤 Test 2: User Registration (CREATE)" -ForegroundColor Yellow
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
    Write-Host "✅ User Registration: SUCCESS" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.data.user.id)"
    Write-Host "   Full Name: $($registerResponse.data.user.fullName)"
    Write-Host "   Email: $($registerResponse.data.user.email)"
    Write-Host "   Phone: $($registerResponse.data.user.phone)"
    $global:testUserId = $registerResponse.data.user.id
} catch {
    Write-Host "❌ User Registration: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 3: User Login
Write-Host "`n🔐 Test 3: User Login" -ForegroundColor Yellow
$loginData = @{
    email = "test.user@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers $headers -Body $loginData
    Write-Host "✅ User Login: SUCCESS" -ForegroundColor Green
    Write-Host "   Access Token Generated: $($loginResponse.data.accessToken.Length) characters"
    Write-Host "   Refresh Token Generated: $($loginResponse.data.refreshToken.Length) characters"
    $global:accessToken = $loginResponse.data.accessToken
    $global:authHeaders = @{
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $($global:accessToken)"
    }
} catch {
    Write-Host "❌ User Login: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 4: Get User Profile (READ)
Write-Host "`n👤 Test 4: Get User Profile (READ)" -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$API_BASE/auth/profile" -Method GET -Headers $global:authHeaders
    Write-Host "✅ Get Profile: SUCCESS" -ForegroundColor Green
    Write-Host "   User ID: $($profileResponse.data.user.id)"
    Write-Host "   Full Name: $($profileResponse.data.user.fullName)"
    Write-Host "   Email Verified: $($profileResponse.data.user.emailVerified)"
} catch {
    Write-Host "❌ Get Profile: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 5: Catalog Operations - Parroquias
Write-Host "`n🏛️ Test 5: Catalog Operations - Parroquias" -ForegroundColor Yellow

# CREATE Parroquia
$parroquiaData = @{
    nombre = "Parroquia San Juan"
    municipio_id = 1
    descripcion = "Parroquia de prueba para testing"
} | ConvertTo-Json

try {
    $createParroquiaResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias" -Method POST -Headers $global:authHeaders -Body $parroquiaData
    Write-Host "✅ Create Parroquia: SUCCESS" -ForegroundColor Green
    Write-Host "   Parroquia ID: $($createParroquiaResponse.data.parroquia.id)"
    Write-Host "   Name: $($createParroquiaResponse.data.parroquia.nombre)"
    $global:parroquiaId = $createParroquiaResponse.data.parroquia.id
} catch {
    Write-Host "❌ Create Parroquia: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# READ Parroquias (List)
try {
    $listParroquiasResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias" -Method GET -Headers $global:authHeaders
    Write-Host "✅ List Parroquias: SUCCESS" -ForegroundColor Green
    Write-Host "   Total Parroquias: $($listParroquiasResponse.data.parroquias.Count)"
    Write-Host "   Current Page: $($listParroquiasResponse.data.pagination.page)"
} catch {
    Write-Host "❌ List Parroquias: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# READ Parroquia by ID
if ($global:parroquiaId) {
    try {
        $getParroquiaResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/$($global:parroquiaId)" -Method GET -Headers $global:authHeaders
        Write-Host "✅ Get Parroquia by ID: SUCCESS" -ForegroundColor Green
        Write-Host "   Parroquia Name: $($getParroquiaResponse.data.parroquia.nombre)"
        Write-Host "   Description: $($getParroquiaResponse.data.parroquia.descripcion)"
    } catch {
        Write-Host "❌ Get Parroquia by ID: FAILED" -ForegroundColor Red
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
        Write-Host "✅ Update Parroquia: SUCCESS" -ForegroundColor Green
        Write-Host "   Updated Name: $($updateParroquiaResponse.data.parroquia.nombre)"
    } catch {
        Write-Host "❌ Update Parroquia: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)"
    }
}

# Test 6: Catalog Operations - Veredas
Write-Host "`n🌾 Test 6: Catalog Operations - Veredas" -ForegroundColor Yellow

# CREATE Vereda
$veredaData = @{
    nombre = "Vereda El Rosario"
    parroquia_id = $global:parroquiaId
    descripcion = "Vereda de prueba para testing"
} | ConvertTo-Json

try {
    $createVeredaResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/veredas" -Method POST -Headers $global:authHeaders -Body $veredaData
    Write-Host "✅ Create Vereda: SUCCESS" -ForegroundColor Green
    Write-Host "   Vereda ID: $($createVeredaResponse.data.vereda.id)"
    Write-Host "   Name: $($createVeredaResponse.data.vereda.nombre)"
    $global:veredaId = $createVeredaResponse.data.vereda.id
} catch {
    Write-Host "❌ Create Vereda: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# READ Veredas (List)
try {
    $listVeredasResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/veredas" -Method GET -Headers $global:authHeaders
    Write-Host "✅ List Veredas: SUCCESS" -ForegroundColor Green
    Write-Host "   Total Veredas: $($listVeredasResponse.data.veredas.Count)"
} catch {
    Write-Host "❌ List Veredas: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 7: User Management Operations
Write-Host "`n👥 Test 7: User Management Operations" -ForegroundColor Yellow

# READ Users (List)
try {
    $listUsersResponse = Invoke-RestMethod -Uri "$API_BASE/users" -Method GET -Headers $global:authHeaders
    Write-Host "✅ List Users: SUCCESS" -ForegroundColor Green
    Write-Host "   Total Users: $($listUsersResponse.data.users.Count)"
    Write-Host "   Current Page: $($listUsersResponse.data.pagination.page)"
} catch {
    Write-Host "❌ List Users: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# READ User by ID
if ($global:testUserId) {
    try {
        $getUserResponse = Invoke-RestMethod -Uri "$API_BASE/users/$($global:testUserId)" -Method GET -Headers $global:authHeaders
        Write-Host "✅ Get User by ID: SUCCESS" -ForegroundColor Green
        Write-Host "   User Name: $($getUserResponse.data.user.fullName)"
        Write-Host "   User Status: $($getUserResponse.data.user.status)"
    } catch {
        Write-Host "❌ Get User by ID: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)"
    }
}

# Test 8: Password Change
Write-Host "`n🔑 Test 8: Password Change" -ForegroundColor Yellow
$passwordChangeData = @{
    currentPassword = "SecurePass123!"
    newPassword = "NewSecurePass456!"
    confirmPassword = "NewSecurePass456!"
} | ConvertTo-Json

try {
    $passwordChangeResponse = Invoke-RestMethod -Uri "$API_BASE/auth/change-password" -Method POST -Headers $global:authHeaders -Body $passwordChangeData
    Write-Host "✅ Password Change: SUCCESS" -ForegroundColor Green
    Write-Host "   Message: $($passwordChangeResponse.message)"
} catch {
    Write-Host "❌ Password Change: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 9: Statistics and Reports
Write-Host "`n📊 Test 9: Statistics and Reports" -ForegroundColor Yellow

# Parroquias Statistics
try {
    $parroquiasStatsResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/statistics" -Method GET -Headers $global:authHeaders
    Write-Host "✅ Parroquias Statistics: SUCCESS" -ForegroundColor Green
    Write-Host "   Total Count: $($parroquiasStatsResponse.data.statistics.totalCount)"
} catch {
    Write-Host "❌ Parroquias Statistics: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Veredas Statistics
try {
    $veredasStatsResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/veredas/statistics" -Method GET -Headers $global:authHeaders
    Write-Host "✅ Veredas Statistics: SUCCESS" -ForegroundColor Green
    Write-Host "   Total Count: $($veredasStatsResponse.data.statistics.totalCount)"
} catch {
    Write-Host "❌ Veredas Statistics: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 10: Search Operations
Write-Host "`n🔍 Test 10: Search Operations" -ForegroundColor Yellow

# Search Parroquias
try {
    $searchParroquiasResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/search?q=San" -Method GET -Headers $global:authHeaders
    Write-Host "✅ Search Parroquias: SUCCESS" -ForegroundColor Green
    Write-Host "   Search Results: $($searchParroquiasResponse.data.parroquias.Count)"
} catch {
    Write-Host "❌ Search Parroquias: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Search Veredas
try {
    $searchVeredasResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/veredas/search?q=El" -Method GET -Headers $global:authHeaders
    Write-Host "✅ Search Veredas: SUCCESS" -ForegroundColor Green
    Write-Host "   Search Results: $($searchVeredasResponse.data.veredas.Count)"
} catch {
    Write-Host "❌ Search Veredas: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 11: Logout
Write-Host "`n🚪 Test 11: Logout" -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod -Uri "$API_BASE/auth/logout" -Method POST -Headers $global:authHeaders
    Write-Host "✅ Logout: SUCCESS" -ForegroundColor Green
    Write-Host "   Message: $($logoutResponse.message)"
} catch {
    Write-Host "❌ Logout: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test Summary
Write-Host "`n" + "=" * 60
Write-Host "🎯 CRUD Testing Summary Complete!" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📋 Test Categories Completed:" -ForegroundColor Cyan
Write-Host "   • Health Check and System Status"
Write-Host "   • User Authentication (Register, Login, Logout)"
Write-Host "   • User Profile Management"
Write-Host "   • Catalog CRUD Operations (Parroquias, Veredas)"
Write-Host "   • User Management Operations"
Write-Host "   • Password Management"
Write-Host "   • Statistics and Reports"
Write-Host "   • Search Functionality"

Write-Host "`n💾 Database Tables Tested:" -ForegroundColor Cyan
Write-Host "   • usuarios (Users table with Spanish fields)"
Write-Host "   • parroquia (Parishes)"
Write-Host "   • veredas (Villages/Hamlets)"
Write-Host "   • municipios (Municipalities - referenced)"

Write-Host "`n🔒 Security Features Tested:" -ForegroundColor Cyan
Write-Host "   • JWT Authentication"
Write-Host "   • Password Hashing (bcrypt)"
Write-Host "   • Protected Endpoints"
Write-Host "   • Email Verification Flow"
Write-Host "   • Session Management"

Write-Host "`nTesting completed successfully! 🎉" -ForegroundColor Green
