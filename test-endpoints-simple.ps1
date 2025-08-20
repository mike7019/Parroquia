# Script para probar todos los endpoints CRUD
Write-Host "INICIANDO PRUEBAS COMPLETAS DE TODOS LOS ENDPOINTS" -ForegroundColor Cyan

# 1. Obtener token
Write-Host "`n1. AUTENTICACION" -ForegroundColor Magenta
$loginBody = @{
    correo_electronico = "admin@test.com"
    contrasena = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $accessToken = $loginResponse.data.accessToken
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    Write-Host "Token obtenido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error obteniendo token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Probar DEPARTAMENTOS
Write-Host "`n2. PROBANDO DEPARTAMENTOS" -ForegroundColor Cyan
try {
    # CREATE
    $createData = @{ nombre = "Departamento Test"; descripcion = "Departamento de prueba" } | ConvertTo-Json
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/departamentos" -Method POST -Headers $headers -Body $createData
    $departamentoId = $createResponse.data.id
    Write-Host "CREATE exitoso - ID: $departamentoId" -ForegroundColor Green
    
    # READ ALL
    $readAllResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/departamentos" -Method GET -Headers $headers
    Write-Host "READ ALL exitoso - Total: $($readAllResponse.data.Count)" -ForegroundColor Green
    
    # READ BY ID
    $readByIdResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/departamentos/$departamentoId" -Method GET -Headers $headers
    Write-Host "READ BY ID exitoso - Nombre: $($readByIdResponse.data.nombre)" -ForegroundColor Green
    
    # UPDATE
    $updateData = @{ nombre = "Departamento Test ACTUALIZADO" } | ConvertTo-Json
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/departamentos/$departamentoId" -Method PUT -Headers $headers -Body $updateData
    Write-Host "UPDATE exitoso - Nuevo nombre: $($updateResponse.data.nombre)" -ForegroundColor Green
    
    # DELETE
    Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/departamentos/$departamentoId" -Method DELETE -Headers $headers
    Write-Host "DELETE exitoso" -ForegroundColor Green
    
    Write-Host "DEPARTAMENTOS: TODAS LAS OPERACIONES EXITOSAS" -ForegroundColor Green
} catch {
    Write-Host "Error en DEPARTAMENTOS: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Probar MUNICIPIOS
Write-Host "`n3. PROBANDO MUNICIPIOS" -ForegroundColor Cyan
try {
    # CREATE
    $createData = @{ nombre = "Municipio Test"; id_departamento = 1 } | ConvertTo-Json
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method POST -Headers $headers -Body $createData
    $municipioId = $createResponse.data.id
    Write-Host "CREATE exitoso - ID: $municipioId" -ForegroundColor Green
    
    # READ ALL
    $readAllResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios" -Method GET -Headers $headers
    Write-Host "READ ALL exitoso - Total: $($readAllResponse.data.Count)" -ForegroundColor Green
    
    # READ BY ID
    $readByIdResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/$municipioId" -Method GET -Headers $headers
    Write-Host "READ BY ID exitoso - Nombre: $($readByIdResponse.data.nombre)" -ForegroundColor Green
    
    # UPDATE
    $updateData = @{ nombre = "Municipio Test ACTUALIZADO" } | ConvertTo-Json
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/$municipioId" -Method PUT -Headers $headers -Body $updateData
    Write-Host "UPDATE exitoso - Nuevo nombre: $($updateResponse.data.nombre)" -ForegroundColor Green
    
    # DELETE
    Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/municipios/$municipioId" -Method DELETE -Headers $headers
    Write-Host "DELETE exitoso" -ForegroundColor Green
    
    Write-Host "MUNICIPIOS: TODAS LAS OPERACIONES EXITOSAS" -ForegroundColor Green
} catch {
    Write-Host "Error en MUNICIPIOS: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Probar PARENTESCOS
Write-Host "`n4. PROBANDO PARENTESCOS" -ForegroundColor Cyan
try {
    # CREATE
    $createData = @{ nombre = "Parentesco Test"; descripcion = "Parentesco de prueba" } | ConvertTo-Json
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parentescos" -Method POST -Headers $headers -Body $createData
    $parentescoId = $createResponse.data.id
    Write-Host "CREATE exitoso - ID: $parentescoId" -ForegroundColor Green
    
    # READ ALL
    $readAllResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parentescos" -Method GET -Headers $headers
    Write-Host "READ ALL exitoso - Total: $($readAllResponse.data.Count)" -ForegroundColor Green
    
    # READ BY ID
    $readByIdResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parentescos/$parentescoId" -Method GET -Headers $headers
    Write-Host "READ BY ID exitoso - Nombre: $($readByIdResponse.data.nombre)" -ForegroundColor Green
    
    # UPDATE
    $updateData = @{ nombre = "Parentesco Test ACTUALIZADO" } | ConvertTo-Json
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parentescos/$parentescoId" -Method PUT -Headers $headers -Body $updateData
    Write-Host "UPDATE exitoso - Nuevo nombre: $($updateResponse.data.nombre)" -ForegroundColor Green
    
    # DELETE
    Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/parentescos/$parentescoId" -Method DELETE -Headers $headers
    Write-Host "DELETE exitoso" -ForegroundColor Green
    
    Write-Host "PARENTESCOS: TODAS LAS OPERACIONES EXITOSAS" -ForegroundColor Green
} catch {
    Write-Host "Error en PARENTESCOS: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Probar ENFERMEDADES
Write-Host "`n5. PROBANDO ENFERMEDADES" -ForegroundColor Cyan
try {
    # CREATE
    $createData = @{ nombre = "Enfermedad Test"; descripcion = "Enfermedad de prueba" } | ConvertTo-Json
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/enfermedades" -Method POST -Headers $headers -Body $createData
    $enfermedadId = $createResponse.data.id_enfermedad
    Write-Host "CREATE exitoso - ID: $enfermedadId" -ForegroundColor Green
    
    # READ ALL
    $readAllResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/enfermedades" -Method GET -Headers $headers
    Write-Host "READ ALL exitoso - Total: $($readAllResponse.data.Count)" -ForegroundColor Green
    
    # READ BY ID
    $readByIdResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/enfermedades/$enfermedadId" -Method GET -Headers $headers
    Write-Host "READ BY ID exitoso - Nombre: $($readByIdResponse.data.nombre)" -ForegroundColor Green
    
    # UPDATE
    $updateData = @{ nombre = "Enfermedad Test ACTUALIZADA" } | ConvertTo-Json
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/enfermedades/$enfermedadId" -Method PUT -Headers $headers -Body $updateData
    Write-Host "UPDATE exitoso - Nuevo nombre: $($updateResponse.data.nombre)" -ForegroundColor Green
    
    # DELETE
    Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/enfermedades/$enfermedadId" -Method DELETE -Headers $headers
    Write-Host "DELETE exitoso" -ForegroundColor Green
    
    Write-Host "ENFERMEDADES: TODAS LAS OPERACIONES EXITOSAS" -ForegroundColor Green
} catch {
    Write-Host "Error en ENFERMEDADES: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Probar SEXOS
Write-Host "`n6. PROBANDO SEXOS" -ForegroundColor Cyan
try {
    # CREATE
    $createData = @{ nombre = "Sexo Test"; descripcion = "Sexo de prueba" } | ConvertTo-Json
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Method POST -Headers $headers -Body $createData
    $sexoId = $createResponse.data.id
    Write-Host "CREATE exitoso - ID: $sexoId" -ForegroundColor Green
    
    # READ ALL
    $readAllResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos" -Method GET -Headers $headers
    Write-Host "READ ALL exitoso - Total: $($readAllResponse.data.Count)" -ForegroundColor Green
    
    # READ BY ID
    $readByIdResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos/$sexoId" -Method GET -Headers $headers
    Write-Host "READ BY ID exitoso - Nombre: $($readByIdResponse.data.nombre)" -ForegroundColor Green
    
    # UPDATE
    $updateData = @{ nombre = "Sexo Test ACTUALIZADO" } | ConvertTo-Json
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos/$sexoId" -Method PUT -Headers $headers -Body $updateData
    Write-Host "UPDATE exitoso - Nuevo nombre: $($updateResponse.data.nombre)" -ForegroundColor Green
    
    # DELETE
    Invoke-RestMethod -Uri "http://localhost:3000/api/catalog/sexos/$sexoId" -Method DELETE -Headers $headers
    Write-Host "DELETE exitoso" -ForegroundColor Green
    
    Write-Host "SEXOS: TODAS LAS OPERACIONES EXITOSAS" -ForegroundColor Green
} catch {
    Write-Host "Error en SEXOS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPRUEBAS COMPLETADAS - VERIFICAR RESULTADOS ARRIBA" -ForegroundColor Yellow
