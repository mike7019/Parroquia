# Script para probar endpoints de creación
$BASE_URL = "http://localhost:3000/api"

Write-Host "🧪 INICIANDO PRUEBAS DE ENDPOINTS DE CREACIÓN" -ForegroundColor Cyan

# Función para obtener token
function Get-AuthToken {
    $headers = @{ "Content-Type" = "application/json" }
    
    # Registrar usuario de prueba
    $registerData = @{
        email = "test@parroquia.com"
        password = "Test123456!"
        firstName = "Test"
        lastName = "User"
        role = "admin"
        phone = "+57 300 123 4567"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerData -Headers $headers -ErrorAction SilentlyContinue | Out-Null
    } catch {
        # Usuario ya existe
    }
    
    # Login
    $loginData = @{
        email = "test@parroquia.com"
        password = "Test123456!"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginData -Headers $headers
    return $loginResponse.data.accessToken
}

# Obtener token
Write-Host "🔐 Obteniendo token..." -ForegroundColor Yellow
$token = Get-AuthToken
Write-Host "✅ Token obtenido" -ForegroundColor Green

# Headers con autenticación
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$publicHeaders = @{
    "Content-Type" = "application/json"
}

# Función para probar endpoint
function Test-Endpoint($name, $url, $method, $data, $headers) {
    Write-Host "`n🔍 Probando: $name" -ForegroundColor White
    
    $jsonData = $data | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method $method -Body $jsonData -Headers $headers
        
        if ($response.status -eq "success" -and $response.message) {
            if ($response.PSObject.Properties.Name -contains "data" -and $response.data -ne $null) {
                Write-Host "   ❌ FALLO: Contiene datos del objeto" -ForegroundColor Red
                return $false
            } else {
                Write-Host "   ✅ ÉXITO: Solo mensaje" -ForegroundColor Green
                Write-Host "   Mensaje: $($response.message)" -ForegroundColor Green
                return $true
            }
        } else {
            Write-Host "   ❌ FALLO: Estructura incorrecta" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Pruebas
$tests = @()
$successes = 0

Write-Host "`n📋 EJECUTANDO PRUEBAS:" -ForegroundColor Cyan

# Test 1: Registro de usuario
$result1 = Test-Endpoint "Registro de Usuario" "$BASE_URL/auth/register" "POST" @{
    email = "nuevo_$(Get-Random)@test.com"
    password = "Test123456!"
    firstName = "Nuevo"
    lastName = "Usuario"
    role = "surveyor"
    phone = "+57 300 999 8888"
} $publicHeaders

if ($result1) { $successes++ }

# Test 2: Crear Sector
$result2 = Test-Endpoint "Crear Sector" "$BASE_URL/catalog/sectors" "POST" @{
    nombre = "Sector Test $(Get-Random)"
} $authHeaders

if ($result2) { $successes++ }

# Test 3: Crear Sexo
$result3 = Test-Endpoint "Crear Sexo" "$BASE_URL/catalog/sexos" "POST" @{
    sexo = "Test $(Get-Random)"
} $authHeaders

if ($result3) { $successes++ }

# Test 4: Crear Parroquia
$result4 = Test-Endpoint "Crear Parroquia" "$BASE_URL/catalog/parroquias" "POST" @{
    nombre = "Parroquia Test $(Get-Random)"
} $authHeaders

if ($result4) { $successes++ }

# Test 5: Crear Departamento
$result5 = Test-Endpoint "Crear Departamento" "$BASE_URL/catalog/departamentos" "POST" @{
    nombre = "Departamento Test $(Get-Random)"
    codigo_dane = "$(Get-Random -Minimum 10 -Maximum 99)"
    region = "Test Region"
} $authHeaders

if ($result5) { $successes++ }

# Resumen
$total = 5
Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "✅ Exitosas: $successes/$total" -ForegroundColor Green
Write-Host "❌ Fallidas: $($total - $successes)/$total" -ForegroundColor Red

if ($successes -eq $total) {
    Write-Host "`n🎉 ¡TODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
}
