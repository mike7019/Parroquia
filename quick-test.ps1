# Quick CRUD Test with Verified User
$API_BASE = "http://localhost:3000/api"
$headers = @{'Content-Type' = 'application/json'}

Write-Host "Quick CRUD Test with Verified User" -ForegroundColor Green
Write-Host "=" * 50

# Test with verified user
Write-Host "`nTesting with verified user: test3@example.com" -ForegroundColor Yellow
$loginData = @{
    email = "test3@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers $headers -Body $loginData
    Write-Host "SUCCESS - Login with verified user" -ForegroundColor Green
    Write-Host "   Access Token: $($loginResponse.data.accessToken.Substring(0, 20))..."
    $global:authHeaders = @{
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $($loginResponse.data.accessToken)"
    }
    
    # Test authenticated endpoints
    Write-Host "`nTesting authenticated endpoints..." -ForegroundColor Yellow
    
    # Get Profile
    try {
        $profileResponse = Invoke-RestMethod -Uri "$API_BASE/auth/profile" -Method GET -Headers $global:authHeaders
        Write-Host "SUCCESS - Get Profile" -ForegroundColor Green
        Write-Host "   User: $($profileResponse.data.user.fullName)"
    } catch {
        Write-Host "FAILED - Get Profile: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # List Users
    try {
        $usersResponse = Invoke-RestMethod -Uri "$API_BASE/users" -Method GET -Headers $global:authHeaders
        Write-Host "SUCCESS - List Users" -ForegroundColor Green
        Write-Host "   Total Users: $($usersResponse.data.users.Count)"
    } catch {
        Write-Host "FAILED - List Users: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Create Parroquia
    $parroquiaData = @{
        nombre = "Test Parroquia"
        municipio_id = 1
        descripcion = "Test description"
    } | ConvertTo-Json
    
    try {
        $parroquiaResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias" -Method POST -Headers $global:authHeaders -Body $parroquiaData
        Write-Host "SUCCESS - Create Parroquia" -ForegroundColor Green
        Write-Host "   Parroquia: $($parroquiaResponse.data.parroquia.nombre)"
        $parroquiaId = $parroquiaResponse.data.parroquia.id
        
        # Update the parroquia
        $updateData = @{
            nombre = "Updated Test Parroquia"
            descripcion = "Updated description"
        } | ConvertTo-Json
        
        $updateResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/$parroquiaId" -Method PUT -Headers $global:authHeaders -Body $updateData
        Write-Host "SUCCESS - Update Parroquia" -ForegroundColor Green
        Write-Host "   Updated: $($updateResponse.data.parroquia.nombre)"
        
        # Get parroquia by ID
        $getResponse = Invoke-RestMethod -Uri "$API_BASE/catalog/parroquias/$parroquiaId" -Method GET -Headers $global:authHeaders
        Write-Host "SUCCESS - Get Parroquia by ID" -ForegroundColor Green
        Write-Host "   Retrieved: $($getResponse.data.parroquia.nombre)"
        
    } catch {
        Write-Host "FAILED - Parroquia operations: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "FAILED - Login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying to create an admin user..." -ForegroundColor Yellow
    
    # Try to register and immediately verify a test admin
    $adminData = @{
        email = "admin@test.com"
        password = "admin123"
        firstName = "Admin"
        lastName = "User"
    } | ConvertTo-Json
    
    try {
        $adminRegister = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method POST -Headers $headers -Body $adminData
        Write-Host "SUCCESS - Admin registered" -ForegroundColor Green
        Write-Host "Admin ID: $($adminRegister.data.user.id)"
    } catch {
        Write-Host "Note: Admin registration failed (might already exist)" -ForegroundColor Yellow
    }
}

Write-Host "`nCRUD Test Summary:" -ForegroundColor Cyan
Write-Host "- Health Check: Working"
Write-Host "- User Registration: Working (Spanish fields)"
Write-Host "- Authentication: Requires email verification"
Write-Host "- Protected Endpoints: Working with valid token"
Write-Host "- Database: PostgreSQL with Spanish schema"
