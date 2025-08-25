# Pre-deployment verification script for Dokploy (PowerShell version)
# Usage: .\pre-deployment-check.ps1

Write-Host "Verificando configuracion para deployment con Dokploy..." -ForegroundColor Blue

function Test-FileExists {
    param([string]$FilePath)
    if (Test-Path $FilePath) {
        Write-Host "✓ $FilePath existe" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $FilePath NO encontrado" -ForegroundColor Red
        return $false
    }
}

function Test-EnvVar {
    param([string]$VarName, [string]$FilePath)
    if ((Test-Path $FilePath) -and (Select-String -Path $FilePath -Pattern $VarName -Quiet)) {
        Write-Host "✓ Variable $VarName configurada en $FilePath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "! Variable $VarName no encontrada en $FilePath" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "`nVerificando archivos requeridos..." -ForegroundColor Blue

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

$AllFilesOk = $true
foreach ($file in $RequiredFiles) {
    if (-not (Test-FileExists -FilePath $file)) {
        $AllFilesOk = $false
    }
}

Write-Host "`nVerificando configuraciones criticas..." -ForegroundColor Blue

# Check Docker Compose
if (Test-Path "docker-compose.dokploy.yml") {
    $dockerComposeContent = Get-Content "docker-compose.dokploy.yml" -Raw
    
    if ($dockerComposeContent -match "5000:5000") {
        Write-Host "✓ Puerto 5000 configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "✗ Puerto 5000 no configurado en docker-compose.dokploy.yml" -ForegroundColor Red
        $AllFilesOk = $false
    }
    
    if ($dockerComposeContent -match "postgres:15-alpine") {
        Write-Host "✓ PostgreSQL configurado" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL no configurado correctamente" -ForegroundColor Red
        $AllFilesOk = $false
    }
}

# Check Dockerfile
if (Test-Path "Dockerfile") {
    $dockerfileContent = Get-Content "Dockerfile" -Raw
    
    if ($dockerfileContent -match "EXPOSE 5000") {
        Write-Host "✓ Puerto 5000 expuesto en Dockerfile" -ForegroundColor Green
    } else {
        Write-Host "✗ Puerto 5000 no expuesto en Dockerfile" -ForegroundColor Red
        $AllFilesOk = $false
    }
    
    if ($dockerfileContent -match "NODE_ENV=production") {
        Write-Host "✓ NODE_ENV=production configurado" -ForegroundColor Green
    } else {
        Write-Host "! NODE_ENV=production no encontrado" -ForegroundColor Yellow
    }
}

Write-Host "`nVerificando variables de entorno criticas..." -ForegroundColor Blue

# Check environment variables
$EnvFile = ".env.dokploy"
if (Test-Path $EnvFile) {
    $CriticalVars = @(
        "JWT_SECRET",
        "JWT_REFRESH_SECRET", 
        "DB_PASSWORD",
        "PORT",
        "NODE_ENV"
    )
    
    foreach ($var in $CriticalVars) {
        Test-EnvVar -VarName $var -FilePath $EnvFile | Out-Null
    }
    
    # Check for default/weak values
    $envContent = Get-Content $EnvFile -Raw
    if ($envContent -match "CHANGE_THIS") {
        Write-Host "✗ Valores por defecto encontrados en $EnvFile - CAMBIAR EN PRODUCCION" -ForegroundColor Red
        $AllFilesOk = $false
    } else {
        Write-Host "✓ No se encontraron valores por defecto" -ForegroundColor Green
    }
}

Write-Host "`nVerificando dependencias..." -ForegroundColor Blue

# Check package.json
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        Write-Host "✓ package.json valido - Name: $($packageJson.name) | Version: $($packageJson.version)" -ForegroundColor Green
    } catch {
        Write-Host "✗ package.json invalido" -ForegroundColor Red
        $AllFilesOk = $false
    }
}

Write-Host "`nVerificando disponibilidad de Docker..." -ForegroundColor Blue

# Check Docker availability
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✓ Docker disponible: $dockerVersion" -ForegroundColor Green
        Write-Host "! Puedes probar el build con: docker build -t parroquia-api-test ." -ForegroundColor Yellow
    }
} catch {
    Write-Host "! Docker no disponible para testing" -ForegroundColor Yellow
}

Write-Host "`nGenerando resumen..." -ForegroundColor Blue

if ($AllFilesOk) {
    Write-Host "¡Todo listo para deployment con Dokploy!" -ForegroundColor Green
    Write-Host "`nProximos pasos:" -ForegroundColor Blue
    Write-Host "1. Commit y push todos los cambios"
    Write-Host "2. Configura las variables de entorno en Dokploy"
    Write-Host "3. Usa docker-compose.dokploy.yml como archivo de compose"  
    Write-Host "4. Configura el dominio personalizado"
    Write-Host "5. Deploy!"
    Write-Host ""
    Write-Host "IMPORTANTE: Cambia las variables de seguridad en Dokploy:" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET"
    Write-Host "   - JWT_REFRESH_SECRET"
    Write-Host "   - DB_PASSWORD"
    Write-Host "   - FRONTEND_URL (tu dominio real)"
    Write-Host ""
    Write-Host "Lee el archivo DOKPLOY_DEPLOYMENT.md para instrucciones detalladas" -ForegroundColor Cyan
} else {
    Write-Host "Se encontraron problemas. Revisa los errores arriba." -ForegroundColor Red
    exit 1
}
