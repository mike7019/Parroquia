# Script para crear encuesta completa de prueba
# Usar: .\crear-encuesta-completa.ps1

$baseUrl = "http://localhost:3000"
$loginUrl = "$baseUrl/api/auth/login"
$encuestaUrl = "$baseUrl/api/encuesta"

Write-Host "🚀 CREANDO ENCUESTA COMPLETA DE PRUEBA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 1. LOGIN
Write-Host "`n🔐 Paso 1: Autenticación..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@admin.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "   👤 Usuario: $($loginResponse.user.email)" -ForegroundColor White
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "   📄 Detalles: $errorContent" -ForegroundColor Yellow
    }
    exit 1
}

# 2. LEER JSON DE ENCUESTA
Write-Host "`n📋 Paso 2: Cargando datos de encuesta..." -ForegroundColor Yellow

try {
    $encuestaData = Get-Content -Path "ejemplo-encuesta-completa.json" -Raw
    Write-Host "✅ Archivo JSON cargado" -ForegroundColor Green
    
    # Parsear para mostrar resumen
    $encuesta = $encuestaData | ConvertFrom-Json
    Write-Host "   👨‍👩‍👧‍👦 Familia: $($encuesta.informacionGeneral.apellido_familiar)" -ForegroundColor White
    Write-Host "   👥 Miembros vivos: $($encuesta.familyMembers.Count)" -ForegroundColor White
    Write-Host "   🕊️ Miembros fallecidos: $($encuesta.deceasedMembers.Count)" -ForegroundColor White
    Write-Host "   📍 Municipio: $($encuesta.informacionGeneral.municipio.nombre)" -ForegroundColor White
    Write-Host "   ⛪ Parroquia: $($encuesta.informacionGeneral.parroquia.nombre)" -ForegroundColor White
} catch {
    Write-Host "❌ Error leyendo archivo JSON: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. ENVIAR ENCUESTA
Write-Host "`n📤 Paso 3: Enviando encuesta al servidor..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $encuestaUrl -Method POST -Body $encuestaData -Headers $headers
    
    Write-Host "✅ ENCUESTA CREADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "`n📊 RESULTADO:" -ForegroundColor Cyan
    Write-Host "   🆔 ID Familia: $($response.data.familia_id)" -ForegroundColor White
    Write-Host "   📝 Código Familia: $($response.data.codigo_familia)" -ForegroundColor White
    Write-Host "   👥 Personas creadas: $($response.data.personas_creadas)" -ForegroundColor White
    Write-Host "   🕊️ Personas fallecidas: $($response.data.personas_fallecidas)" -ForegroundColor White
    Write-Host "   📅 Fecha: $($response.data.fecha_creacion)" -ForegroundColor White
    
    if ($response.data.familia) {
        Write-Host "`n🏠 DATOS FAMILIA:" -ForegroundColor Cyan
        Write-Host "   Apellido: $($response.data.familia.apellido_familiar)" -ForegroundColor White
        Write-Host "   Teléfono: $($response.data.familia.telefono)" -ForegroundColor White
        Write-Host "   Dirección: $($response.data.familia.direccion_familia)" -ForegroundColor White
        Write-Host "   Tamaño: $($response.data.familia.tamaño_familia) personas" -ForegroundColor White
    }
    
    Write-Host "`n✅ ENCUESTA COMPLETA REGISTRADA CON ÉXITO" -ForegroundColor Green
    
    # Mostrar detalles de miembros
    if ($encuesta.familyMembers) {
        Write-Host "`n👥 MIEMBROS REGISTRADOS:" -ForegroundColor Cyan
        foreach ($miembro in $encuesta.familyMembers) {
            Write-Host "   • $($miembro.nombres)" -ForegroundColor White
            Write-Host "     - ID: $($miembro.numeroIdentificacion)" -ForegroundColor Gray
            Write-Host "     - Parentesco: $($miembro.parentesco.nombre)" -ForegroundColor Gray
            if ($miembro.habilidades) {
                Write-Host "     - Habilidades: $($miembro.habilidades.Count)" -ForegroundColor Gray
            }
            if ($miembro.destrezas) {
                Write-Host "     - Destrezas: $($miembro.destrezas.Count)" -ForegroundColor Gray
            }
            if ($miembro.celebraciones) {
                Write-Host "     - Celebraciones: $($miembro.celebraciones.Count)" -ForegroundColor Gray
            }
            if ($miembro.enfermedades) {
                Write-Host "     - Enfermedades: $($miembro.enfermedades.Count)" -ForegroundColor Gray
            }
        }
    }
    
    if ($encuesta.deceasedMembers -and $encuesta.deceasedMembers.Count -gt 0) {
        Write-Host "`n🕊️ MIEMBROS FALLECIDOS:" -ForegroundColor Cyan
        foreach ($difunto in $encuesta.deceasedMembers) {
            Write-Host "   • $($difunto.nombres)" -ForegroundColor White
            Write-Host "     - Fecha fallecimiento: $($difunto.fechaAniversario)" -ForegroundColor Gray
            Write-Host "     - Causa: $($difunto.causa_fallecimiento)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n🎉 PROCESO COMPLETADO" -ForegroundColor Green
    
    # Guardar ID para uso posterior
    $response.data.familia_id | Out-File -FilePath "ultimo-familia-id.txt" -NoNewline
    Write-Host "💾 ID guardado en ultimo-familia-id.txt" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ ERROR AL CREAR ENCUESTA" -ForegroundColor Red
    Write-Host "   Mensaje: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "`n📄 DETALLES DEL ERROR:" -ForegroundColor Yellow
        
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Host "   Status: $($errorJson.status)" -ForegroundColor White
            Write-Host "   Code: $($errorJson.code)" -ForegroundColor White
            Write-Host "   Message: $($errorJson.message)" -ForegroundColor White
            
            if ($errorJson.details) {
                Write-Host "   Details: $($errorJson.details)" -ForegroundColor White
            }
            
            if ($errorJson.errors) {
                Write-Host "`n   Errores de validación:" -ForegroundColor Yellow
                foreach ($error in $errorJson.errors) {
                    Write-Host "     • Campo: $($error.field)" -ForegroundColor White
                    Write-Host "       Mensaje: $($error.message)" -ForegroundColor White
                }
            }
        } catch {
            Write-Host "   $errorContent" -ForegroundColor White
        }
    }
    
    exit 1
}
