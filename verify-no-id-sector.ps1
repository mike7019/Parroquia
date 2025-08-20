# 🔍 Script para verificar que NO haya referencias problemáticas a id_sector

Write-Host "🔍 Verificando que no haya referencias problemáticas a id_sector..." -ForegroundColor Blue
Write-Host "📅 $(Get-Date)" -ForegroundColor Blue
Write-Host ""

# Archivos donde NO debe haber referencias activas a id_sector
$PROBLEM_FILES = @(
    "src/models/catalog/Veredas.js",
    "src/models/catalog/index.js",
    "src/services/catalog/veredaService.js",
    "src/config/swagger.js"
)

$FOUND_PROBLEMS = 0

Write-Host "ℹ️  Verificando archivos críticos..." -ForegroundColor Blue

foreach ($file in $PROBLEM_FILES) {
    if (Test-Path $file) {
        Write-Host "ℹ️  Verificando: $file" -ForegroundColor Blue
        
        # Buscar referencias activas (no comentadas) a id_sector
        $content = Get-Content $file -ErrorAction SilentlyContinue
        $activeRefs = $content | Select-String "id_sector" | Where-Object { 
            $_.Line -notmatch "^\s*//|^\s*\*|^\s*/\*" -and 
            $_.Line -notmatch "console\.log|comment|description"
        }
        
        if ($activeRefs) {
            Write-Host "❌ Encontradas referencias activas a id_sector en $file:" -ForegroundColor Red
            $activeRefs | ForEach-Object { Write-Host "   Línea $($_.LineNumber): $($_.Line)" -ForegroundColor Yellow }
            $FOUND_PROBLEMS++
        } else {
            Write-Host "✅ $file - Sin referencias problemáticas" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Archivo no encontrado: $file" -ForegroundColor Yellow
    }
}

# Verificar asociaciones activas en archivos de modelos
Write-Host "ℹ️  Verificando asociaciones activas..." -ForegroundColor Blue

$ASSOCIATION_FILES = @(
    "src/models/index.js",
    "src/models/catalog/index.js"
)

foreach ($file in $ASSOCIATION_FILES) {
    if (Test-Path $file) {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        $activeAssociations = $content | Select-String "Veredas.*Sector|Sector.*Veredas" | Where-Object { 
            $_.Line -notmatch "^\s*//|^\s*\*|^\s*/\*"
        }
        
        if ($activeAssociations) {
            Write-Host "❌ Encontradas asociaciones activas Vereda-Sector en $file:" -ForegroundColor Red
            $activeAssociations | ForEach-Object { Write-Host "   Línea $($_.LineNumber): $($_.Line)" -ForegroundColor Yellow }
            $FOUND_PROBLEMS++
        } else {
            Write-Host "✅ $file - Sin asociaciones problemáticas" -ForegroundColor Green
        }
    }
}

# Verificar que el modelo Veredas tenga la estructura correcta
Write-Host "ℹ️  Verificando estructura del modelo Veredas..." -ForegroundColor Blue

if (Test-Path "src/models/catalog/Veredas.js") {
    $veredasContent = Get-Content "src/models/catalog/Veredas.js"
    if ($veredasContent | Select-String "id_sector") {
        Write-Host "❌ El modelo Veredas.js aún contiene referencias a id_sector" -ForegroundColor Red
        $FOUND_PROBLEMS++
    } else {
        Write-Host "✅ Modelo Veredas sin referencias a id_sector" -ForegroundColor Green
    }
}

# Resumen final
Write-Host ""
Write-Host "📋 RESUMEN DE VERIFICACIÓN" -ForegroundColor Blue
Write-Host "==========================" -ForegroundColor Blue

if ($FOUND_PROBLEMS -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡NO SE ENCONTRARON PROBLEMAS!" -ForegroundColor Green
    Write-Host "✅ Todos los archivos están limpios de referencias problemáticas a id_sector" -ForegroundColor Green
    Write-Host "✅ El deploy-to-server.sh debería funcionar correctamente ahora" -ForegroundColor Green
    Write-Host ""
    Write-Host "ℹ️  Puedes proceder con confianza a ejecutar el deployment" -ForegroundColor Blue
    exit 0
} else {
    Write-Host ""
    Write-Host "🚨 SE ENCONTRARON $FOUND_PROBLEMS PROBLEMA(S)" -ForegroundColor Red
    Write-Host "❌ Es necesario corregir las referencias antes del deployment" -ForegroundColor Red
    Write-Host ""
    Write-Host "ℹ️  Revisa los archivos mencionados arriba y elimina/comenta las referencias a id_sector" -ForegroundColor Blue
    exit 1
}
