# Pre-deployment verification script for Dokploy
# Usage: .\pre-deployment-check.ps1

Write-Host "Verificando configuracion para deployment con Dokploy..." -ForegroundColor Blue

$AllFilesOk = $true

# Required files
$RequiredFiles = @(
    "Dockerfile",
    "docker-compose.yml", 
    "docker-compose.dokploy.yml",
    ".env.dokploy",
    "ecosystem.config.cjs",
    "package.json",
    "src/app.js"
)

Write-Host "`nVerificando archivos requeridos..." -ForegroundColor Blue

foreach ($file in $RequiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file existe" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] $file NO encontrado" -ForegroundColor Red
        $AllFilesOk = $false
    }
}

Write-Host "`nVerificando configuraciones criticas..." -ForegroundColor Blue

# Check Docker Compose
if (Test-Path "docker-compose.dokploy.yml") {
    $dockerComposeContent = Get-Content "docker-compose.dokploy.yml" -Raw
    
    if ($dockerComposeContent -match "5000:5000") {
        Write-Host "  [OK] Puerto 5000 configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Puerto 5000 no configurado" -ForegroundColor Red
        $AllFilesOk = $false
    }
    
    if ($dockerComposeContent -match "postgres:15-alpine") {
        Write-Host "  [OK] PostgreSQL configurado" -ForegroundColor Green  
    } else {
        Write-Host "  [ERROR] PostgreSQL no configurado" -ForegroundColor Red
        $AllFilesOk = $false
    }
}

# Check Dockerfile
if (Test-Path "Dockerfile") {
    $dockerfileContent = Get-Content "Dockerfile" -Raw
    
    if ($dockerfileContent -match "EXPOSE 5000") {
        Write-Host "  [OK] Puerto 5000 expuesto en Dockerfile" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Puerto 5000 no expuesto en Dockerfile" -ForegroundColor Red
        $AllFilesOk = $false
    }
}

Write-Host "`nVerificando variables de entorno..." -ForegroundColor Blue

if (Test-Path ".env.dokploy") {
    $envContent = Get-Content ".env.dokploy" -Raw
    
    $CriticalVars = @("JWT_SECRET", "JWT_REFRESH_SECRET", "DB_PASSWORD", "PORT", "NODE_ENV")
    
    foreach ($var in $CriticalVars) {
        if ($envContent -match $var) {
            Write-Host "  [OK] Variable $var configurada" -ForegroundColor Green
        } else {
            Write-Host "  [WARNING] Variable $var no encontrada" -ForegroundColor Yellow
        }
    }
    
    if ($envContent -match "CHANGE_THIS") {
        Write-Host "  [ERROR] Valores por defecto encontrados - CAMBIAR EN PRODUCCION" -ForegroundColor Red
        $AllFilesOk = $false
    } else {
        Write-Host "  [OK] No se encontraron valores por defecto" -ForegroundColor Green
    }
}

Write-Host "`nVerificando package.json..." -ForegroundColor Blue

if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        Write-Host "  [OK] package.json valido - $($packageJson.name) v$($packageJson.version)" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] package.json invalido" -ForegroundColor Red
        $AllFilesOk = $false
    }
}

Write-Host "`nResumen final..." -ForegroundColor Blue

if ($AllFilesOk) {
    Write-Host "`nTodo listo para deployment con Dokploy!" -ForegroundColor Green
    Write-Host "`nProximos pasos:" -ForegroundColor Cyan
    Write-Host "1. git add . && git commit -m 'Configuracion para Dokploy'"
    Write-Host "2. git push origin feature"
    Write-Host "3. En Dokploy: usar docker-compose.dokploy.yml"
    Write-Host "4. Configurar variables de entorno en Dokploy"
    Write-Host "5. Configurar dominio personalizado"
    Write-Host "`nIMPORTANTE: Cambiar estas variables en Dokploy:" -ForegroundColor Yellow
    Write-Host "- JWT_SECRET"
    Write-Host "- JWT_REFRESH_SECRET" 
    Write-Host "- DB_PASSWORD"
    Write-Host "- FRONTEND_URL"
} else {
    Write-Host "`nSe encontraron problemas. Revisa los errores arriba." -ForegroundColor Red
    exit 1
}
