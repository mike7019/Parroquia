# Script para probar todos los endpoints de creación
# Verifica que solo devuelvan mensaje exitoso sin datos del objeto

$BASE_URL = "http://localhost:3000/api"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🧪 INICIANDO PRUEBAS DE ENDPOINTS DE CREACIÓN" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Función para hacer login y obtener token
function Get-AuthToken {
    Write-Host "🔐 Obteniendo token de autenticación..." -ForegroundColor Yellow
    
    # Primero intentar registrar un usuario de prueba
    $registerData = @{
        email = "test@parroquia.com"
        password = "Test123456!"
        firstName = "Test"
        lastName = "User"
        role = "admin"
        phone = "+57 300 123 4567"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerData -Headers $headers -ErrorAction SilentlyContinue
        Write-Host "✅ Usuario de prueba registrado (o ya existía)" -ForegroundColor Green
    } catch {
        # El usuario ya existe, continuamos
    }
    
    # Hacer login
    $loginData = @{
        email = "test@parroquia.com"
        password = "Test123456!"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginData -Headers $headers
        return $loginResponse.data.accessToken
    } catch {
        Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para probar un endpoint
function Test-CreationEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method,
        [hashtable]$Data,
        [string]$Token,
        [string]$ExpectedMessage
    )
    
    Write-Host "`n🔍 Probando: $Name" -ForegroundColor White
    Write-Host "   Endpoint: $Method $Url" -ForegroundColor Gray
    
    $testHeaders = $headers.Clone()
    if ($Token) {
        $testHeaders["Authorization"] = "Bearer $Token"
    }
    
    $jsonData = $Data | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonData -Headers $testHeaders
        
        # Verificar estructura de respuesta
        if ($response.status -eq "success" -and $response.message) {
            if ($response.PSObject.Properties.Name -contains "data" -and $response.data -ne $null) {
                Write-Host "   ❌ FALLO: Respuesta contiene datos del objeto" -ForegroundColor Red
                Write-Host "   Respuesta: $($response | ConvertTo-Json)" -ForegroundColor Yellow
                return $false
            } else {
                Write-Host "   ✅ ÉXITO: Solo mensaje, sin datos del objeto" -ForegroundColor Green
                Write-Host "   Mensaje: $($response.message)" -ForegroundColor Green
                return $true
            }
        } else {
            Write-Host "   ❌ FALLO: Estructura de respuesta incorrecta" -ForegroundColor Red
            Write-Host "   Respuesta: $($response | ConvertTo-Json)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse) {
            $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   ❌ ERROR HTTP $($errorResponse.StatusCode): $responseBody" -ForegroundColor Red
        } else {
            Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Obtener token de autenticación
$token = Get-AuthToken
if (-not $token) {
    Write-Host "❌ No se pudo obtener token de autenticación. Saliendo..." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green

# Lista de endpoints a probar
$tests = @(
    @{
        Name = "Registro de Usuario"
        Url = "$BASE_URL/auth/register"
        Method = "POST"
        Data = @{
            email = "nuevo_usuario_$(Get-Random)@test.com"
            password = "Test123456!"
            firstName = "Nuevo"
            lastName = "Usuario"
            role = "surveyor"
            phone = "+57 300 999 8888"
        }
        Token = $null
        ExpectedMessage = "Usuario registrado exitosamente"
    },
    @{
        Name = "Crear Sector"
        Url = "$BASE_URL/catalog/sectors"
        Method = "POST"
        Data = @{
            nombre = "Sector Test $(Get-Random)"
        }
        Token = $token
        ExpectedMessage = "Sector creado exitosamente"
    },
    @{
        Name = "Crear Sexo"
        Url = "$BASE_URL/catalog/sexos"
        Method = "POST"
        Data = @{
            sexo = "Test $(Get-Random)"
        }
        Token = $token
        ExpectedMessage = "Sexo creado exitosamente"
    },
    @{
        Name = "Crear Parroquia"
        Url = "$BASE_URL/catalog/parroquias"
        Method = "POST"
        Data = @{
            nombre = "Parroquia Test $(Get-Random)"
        }
        Token = $token
        ExpectedMessage = "Parroquia creada exitosamente"
    },
    @{
        Name = "Crear Departamento"
        Url = "$BASE_URL/catalog/departamentos"
        Method = "POST"
        Data = @{
            nombre = "Departamento Test $(Get-Random)"
            codigo_dane = "$(Get-Random -Minimum 10 -Maximum 99)"
            region = "Test Region"
        }
        Token = $token
        ExpectedMessage = "Departamento creado exitosamente"
    }
)

# Ejecutar todas las pruebas
$successCount = 0
$totalTests = $tests.Count

foreach ($test in $tests) {
    $result = Test-CreationEndpoint -Name $test.Name -Url $test.Url -Method $test.Method -Data $test.Data -Token $test.Token -ExpectedMessage $test.ExpectedMessage
    if ($result) {
        $successCount++
    }
    Start-Sleep -Milliseconds 500
}

# Resumen final
Write-Host "`n📊 RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "✅ Pruebas exitosas: $successCount/$totalTests" -ForegroundColor Green
Write-Host "❌ Pruebas fallidas: $($totalTests - $successCount)/$totalTests" -ForegroundColor Red

if ($successCount -eq $totalTests) {
    Write-Host "`n🎉 ¡TODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
    Write-Host "Todos los endpoints de creación devuelven solo mensajes exitosos sin datos del objeto." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
    Write-Host "Revisar los endpoints que aún devuelven datos del objeto." -ForegroundColor Yellow
}
