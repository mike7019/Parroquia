# Script para consultar una encuesta por ID

param(
    [Parameter(Mandatory=$false)]
    [string]$FamiliaId = "32",
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "`nCONSULTANDO ENCUESTA ID: $FamiliaId`n" -ForegroundColor Cyan

# 1. Login
Write-Host "Paso 1: Autenticación..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method POST `
        -Body (@{
            correo_electronico = "admin@parroquia.com"
            contrasena = "Admin123!"
        } | ConvertTo-Json) `
        -ContentType "application/json"
    
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login exitoso`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}

# 2. Consultar encuesta
Write-Host "Paso 2: Consultando encuesta..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $encuesta = Invoke-RestMethod -Uri "$BaseUrl/api/encuesta/$FamiliaId" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Encuesta obtenida exitosamente`n" -ForegroundColor Green
    
    # Mostrar información resumida
    Write-Host "📋 INFORMACIÓN DE LA FAMILIA:" -ForegroundColor Cyan
    Write-Host "   Apellido: $($encuesta.data.apellido_familiar)"
    Write-Host "   Código: $($encuesta.data.codigo_familia)"
    $tam = $encuesta.data.'tamaño_familia'
    Write-Host "   Tamaño: $tam miembros"
    Write-Host "   Estado: $($encuesta.data.estado_encuesta)"
    
    Write-Host "`n🏠 VIVIENDA:" -ForegroundColor Cyan
    Write-Host "   Tipo: $($encuesta.data.tipo_vivienda.nombre) (ID: $($encuesta.data.tipo_vivienda.id))"
    
    Write-Host "`n🗑️ DISPOSICIÓN DE BASURAS:" -ForegroundColor Cyan
    if ($encuesta.data.basuras -and $encuesta.data.basuras.Count -gt 0) {
        foreach ($basura in $encuesta.data.basuras) {
            Write-Host "   ✓ $($basura.nombre) (ID: $($basura.id))"
        }
    } else {
        Write-Host "   ⚠️ Sin datos" -ForegroundColor Yellow
    }
    
    Write-Host "`n💧 SISTEMA DE ACUEDUCTO:" -ForegroundColor Cyan
    if ($encuesta.data.acueducto) {
        Write-Host "   ✓ $($encuesta.data.acueducto.nombre) (ID: $($encuesta.data.acueducto.id))"
    } else {
        Write-Host "   ⚠️ Sin datos" -ForegroundColor Yellow
    }
    
    Write-Host "`n🚰 AGUAS RESIDUALES:" -ForegroundColor Cyan
    if ($encuesta.data.aguas_residuales -and $encuesta.data.aguas_residuales.Count -gt 0) {
        foreach ($agua in $encuesta.data.aguas_residuales) {
            Write-Host "   ✓ $($agua.nombre) (ID: $($agua.id))"
        }
    } else {
        Write-Host "   ⚠️ Sin datos" -ForegroundColor Yellow
    }
    
    Write-Host "`n👥 MIEMBROS ($($encuesta.data.miembros_familia.total_miembros)):" -ForegroundColor Cyan
    foreach ($persona in $encuesta.data.miembros_familia.personas) {
        Write-Host "   • $($persona.nombre_completo)"
        Write-Host "     - Identificación: $($persona.identificacion.numero)"
        Write-Host "     - Edad: $($persona.edad) años"
        Write-Host "     - Habilidades: $($persona.habilidades.Count)"
        Write-Host "     - Destrezas: $($persona.destrezas.Count)"
    }
    
    Write-Host "`n⚰️ DIFUNTOS ($($encuesta.data.deceasedMembers.Count)):" -ForegroundColor Cyan
    foreach ($difunto in $encuesta.data.deceasedMembers) {
        Write-Host "   • $($difunto.nombres)"
        Write-Host "     - Fecha fallecimiento: $($difunto.fechaFallecimiento)"
    }
    
    # Guardar JSON completo
    $jsonPath = "encuesta-$FamiliaId.json"
    $encuesta | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding utf8
    Write-Host "`n💾 JSON completo guardado en: $jsonPath" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error consultando encuesta:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "`n   Code: $($errorObj.code)" -ForegroundColor Yellow
            Write-Host "   Message: $($errorObj.message)" -ForegroundColor Yellow
        } catch {
            Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
    }
    exit 1
}
