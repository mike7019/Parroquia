$headers = @{
    'Content-Type' = 'application/json'
}

$API_BASE = "http://localhost:3000/api"

Write-Host "🧪 TESTING USER REGISTRATION FIX" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: User Registration
Write-Host "`n🔐 Test 1: User Registration" -ForegroundColor Yellow

$registrationData = @{
    correo_electronico = "test.fix@example.com"
    contrasena = "TestPassword123!"
    primer_nombre = "Test"
    segundo_nombre = "Fix"
    primer_apellido = "User"
    segundo_apellido = "Registration"
    telefono = "+57 300 123 4567"
    rol = "Encuestador"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method POST -Headers $headers -Body $registrationData
    Write-Host "✅ Registration: SUCCESS" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.data.user.correo_electronico)" -ForegroundColor Gray
    Write-Host "   Name: $($registerResponse.data.user.primer_nombre) $($registerResponse.data.user.primer_apellido)" -ForegroundColor Gray
    $global:testUserId = $registerResponse.data.user.id
    $global:testToken = $registerResponse.data.accessToken
    $testSuccessful = $true
} catch {
    Write-Host "❌ Registration: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $testSuccessful = $false
}

# Test 2: Login (if registration was successful)
if ($testSuccessful) {
    Write-Host "`n🔑 Test 2: User Login" -ForegroundColor Yellow
    
    $loginData = @{
        correo_electronico = "test.fix@example.com"
        contrasena = "TestPassword123!"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers $headers -Body $loginData
        Write-Host "✅ Login: SUCCESS" -ForegroundColor Green
        Write-Host "   User ID: $($loginResponse.data.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($loginResponse.data.user.correo_electronico)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Login: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 3: Profile Access
    Write-Host "`n👤 Test 3: Profile Access" -ForegroundColor Yellow
    
    $authHeaders = @{
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $global:testToken"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$API_BASE/auth/profile" -Method GET -Headers $authHeaders
        Write-Host "✅ Profile Access: SUCCESS" -ForegroundColor Green
        Write-Host "   User ID: $($profileResponse.data.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($profileResponse.data.user.correo_electronico)" -ForegroundColor Gray
        Write-Host "   Active: $($profileResponse.data.user.activo)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Profile Access: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Cleanup
Write-Host "`n🧹 Cleanup" -ForegroundColor Yellow
try {
    docker exec parroquia-postgres psql -U parroquia_user -d parroquia_db -c "DELETE FROM usuarios WHERE correo_electronico = 'test.fix@example.com';" | Out-Null
    Write-Host "✅ Test user cleaned up" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Cleanup failed (user might not exist)" -ForegroundColor Yellow
}

Write-Host "`n🎉 REGISTRATION FIX TEST COMPLETED" -ForegroundColor Cyan
if ($testSuccessful) {
    Write-Host "✅ The registration issue has been RESOLVED!" -ForegroundColor Green
    Write-Host "📋 Key fixes applied:" -ForegroundColor Gray
    Write-Host "   • Fixed Role model timestamp configuration" -ForegroundColor Gray
    Write-Host "   • Fixed UsuarioRole model timestamp configuration" -ForegroundColor Gray
    Write-Host "   • Populated missing roles in database" -ForegroundColor Gray
    Write-Host "   • Updated authService to handle usuarios_roles correctly" -ForegroundColor Gray
} else {
    Write-Host "❌ Registration issue still exists - check logs for details" -ForegroundColor Red
}
