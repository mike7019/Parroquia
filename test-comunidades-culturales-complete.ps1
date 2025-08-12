# Test Comunidades Culturales API
# Variables
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/catalog"

# Credenciales de usuario
$loginData = @{
    email = "diego.garciasdsd5105@yopmail.com"
    password = "Fuerte789&"
} | ConvertTo-Json

Write-Host "🔐 Iniciando sesión..." -ForegroundColor Blue

try {
    # Hacer login
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.data.access_token
        Write-Host "✅ Login exitoso" -ForegroundColor Green
        Write-Host "🎫 Token obtenido: $($token.Substring(0, 50))..." -ForegroundColor Yellow
        
        # Headers con autenticación
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        Write-Host "`n📋 Probando endpoint GET /comunidades-culturales..." -ForegroundColor Blue
        
        # Test GET - Obtener todas las comunidades culturales
        $getAllResponse = Invoke-RestMethod -Uri "$apiUrl/comunidades-culturales" -Method GET -Headers $headers
        
        Write-Host "✅ GET exitoso - Total de comunidades: $($getAllResponse.data.total)" -ForegroundColor Green
        Write-Host "📊 Primeras 3 comunidades:" -ForegroundColor Cyan
        
        $getAllResponse.data.comunidadesCulturales | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - ID: $($_.id_comunidad_cultural), Nombre: $($_.nombre)" -ForegroundColor White
        }
        
        Write-Host "`n🔍 Probando endpoint GET con búsqueda..." -ForegroundColor Blue
        
        # Test GET con búsqueda
        $searchResponse = Invoke-RestMethod -Uri "$apiUrl/comunidades-culturales?search=indígena" -Method GET -Headers $headers
        
        Write-Host "✅ Búsqueda exitosa - Resultados encontrados: $($searchResponse.data.total)" -ForegroundColor Green
        
        if ($searchResponse.data.comunidadesCulturales.Count -gt 0) {
            Write-Host "🔍 Resultados de búsqueda:" -ForegroundColor Cyan
            $searchResponse.data.comunidadesCulturales | ForEach-Object {
                Write-Host "  - ID: $($_.id_comunidad_cultural), Nombre: $($_.nombre)" -ForegroundColor White
            }
        }
        
        Write-Host "`n➕ Probando endpoint POST - Crear nueva comunidad cultural..." -ForegroundColor Blue
        
        # Test POST - Crear nueva comunidad cultural
        $newComunidad = @{
            nombre = "Test Comunidad Cultural"
            descripcion = "Comunidad cultural de prueba para testing"
            activo = $true
        } | ConvertTo-Json
        
        $postResponse = Invoke-RestMethod -Uri "$apiUrl/comunidades-culturales" -Method POST -Body $newComunidad -Headers $headers
        
        Write-Host "✅ POST exitoso - Nueva comunidad creada con ID: $($postResponse.data.id_comunidad_cultural)" -ForegroundColor Green
        
        $createdId = $postResponse.data.id_comunidad_cultural
        
        Write-Host "`n🔍 Probando endpoint GET by ID..." -ForegroundColor Blue
        
        # Test GET by ID
        $getByIdResponse = Invoke-RestMethod -Uri "$apiUrl/comunidades-culturales/$createdId" -Method GET -Headers $headers
        
        Write-Host "✅ GET by ID exitoso:" -ForegroundColor Green
        Write-Host "  - ID: $($getByIdResponse.data.id_comunidad_cultural)" -ForegroundColor White
        Write-Host "  - Nombre: $($getByIdResponse.data.nombre)" -ForegroundColor White
        Write-Host "  - Descripción: $($getByIdResponse.data.descripcion)" -ForegroundColor White
        
        Write-Host "`n✏️ Probando endpoint PUT - Actualizar comunidad cultural..." -ForegroundColor Blue
        
        # Test PUT - Actualizar comunidad cultural
        $updateData = @{
            nombre = "Test Comunidad Cultural Actualizada"
            descripcion = "Descripción actualizada para testing"
            activo = $true
        } | ConvertTo-Json
        
        $putResponse = Invoke-RestMethod -Uri "$apiUrl/comunidades-culturales/$createdId" -Method PUT -Body $updateData -Headers $headers
        
        Write-Host "✅ PUT exitoso - Comunidad actualizada:" -ForegroundColor Green
        Write-Host "  - Nuevo nombre: $($putResponse.data.nombre)" -ForegroundColor White
        
        Write-Host "`n🗑️ Probando endpoint DELETE - Eliminar comunidad cultural..." -ForegroundColor Blue
        
        # Test DELETE
        $deleteResponse = Invoke-RestMethod -Uri "$apiUrl/comunidades-culturales/$createdId" -Method DELETE -Headers $headers
        
        Write-Host "✅ DELETE exitoso - Comunidad eliminada" -ForegroundColor Green
        
        Write-Host "`n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!" -ForegroundColor Green
        Write-Host "✅ API de Comunidades Culturales funcionando correctamente" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Error en login: $($loginResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error durante las pruebas:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "📟 Código de estado HTTP: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "📄 Respuesta del error: $errorBody" -ForegroundColor Yellow
        } catch {
            Write-Host "No se pudo leer el cuerpo del error" -ForegroundColor Yellow
        }
    }
}
