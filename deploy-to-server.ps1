# 🚀 SCRIPT DE DEPLOYMENT COMPLETO PARA SERVIDOR REMOTO (PowerShell)
# Este script sincroniza todos los cambios de BD y código en el servidor

param(
    [switch]$SkipBackup,
    [switch]$Force
)

Write-Host "🚀 Iniciando deployment completo en servidor remoto..." -ForegroundColor Blue
Write-Host "📅 Fecha: $(Get-Date)" -ForegroundColor Blue
Write-Host ""

# Funciones para logging
function Log-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Log-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Log-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Log-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# 1. BACKUP DE SEGURIDAD
if (-not $SkipBackup) {
    Log-Info "Creando backup de seguridad..."
    $BackupDir = "backups\deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # Backup de BD (si pg_dump está disponible)
    Log-Info "Backup de base de datos..."
    if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
        $env:PGPASSWORD = $env:DB_PASSWORD
        pg_dump -h $($env:DB_HOST ?? "localhost") -U $($env:DB_USER ?? "parroquia_user") -d $($env:DB_NAME ?? "parroquia_db") -f "$BackupDir\database_backup.sql"
        Log-Success "Backup de BD creado: $BackupDir\database_backup.sql"
    } else {
        Log-Warning "pg_dump no encontrado, saltando backup de BD"
    }
}

try {
    # 2. ACTUALIZAR CÓDIGO
    Log-Info "Actualizando código desde repositorio..."
    
    # Verificar si hay cambios locales
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Log-Warning "Hay cambios locales, guardando stash..."
        git stash push -m "Deploy backup $(Get-Date -Format 'yyyyMMdd_HHmmss')"
    }
    
    # Fetch y pull
    git fetch origin
    Log-Info "Cambiando a rama feature..."
    git checkout feature
    git pull origin feature
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Código actualizado correctamente"
    } else {
        throw "Error actualizando código"
    }
    
    # 3. INSTALAR/ACTUALIZAR DEPENDENCIAS
    Log-Info "Instalando dependencias..."
    npm install --production
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Dependencias instaladas"
    } else {
        throw "Error instalando dependencias"
    }
    
    # 4. VERIFICAR VARIABLES DE ENTORNO
    Log-Info "Verificando configuración..."
    if (-not (Test-Path ".env")) {
        Log-Error "Archivo .env no encontrado"
        Write-Host "Crea el archivo .env con las variables necesarias:" -ForegroundColor Yellow
        Write-Host "DB_HOST=localhost" -ForegroundColor Yellow
        Write-Host "DB_USER=parroquia_user" -ForegroundColor Yellow
        Write-Host "DB_PASSWORD=tu_password" -ForegroundColor Yellow
        Write-Host "DB_NAME=parroquia_db" -ForegroundColor Yellow
        Write-Host "DB_PORT=5432" -ForegroundColor Yellow
        throw "Configuración incompleta"
    }
    
    # 5. PROBAR CONEXIÓN A BD
    Log-Info "Probando conexión a base de datos..."
    $testConnection = @"
import sequelize from './config/sequelize.js';
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a BD exitosa');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error conexión BD:', err.message);
    process.exit(1);
  });
"@
    
    $testConnection | node --input-type=module
    
    if ($LASTEXITCODE -ne 0) {
        throw "No se puede conectar a la base de datos"
    }
    
    # 6. EJECUTAR SINCRONIZACIÓN DE BD
    Log-Info "Ejecutando sincronización de base de datos..."
    
    if (-not $Force) {
        Write-Host "⚠️  IMPORTANTE: Esto va a sincronizar la BD con los modelos actualizados" -ForegroundColor Yellow
        $confirmation = Read-Host "¿Continuar? (s/N)"
        if ($confirmation -ne 's' -and $confirmation -ne 'S') {
            Write-Host "Deployment cancelado por el usuario" -ForegroundColor Yellow
            exit
        }
    }
    
    node syncDatabaseComplete.js
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Sincronización de BD completada"
    } else {
        throw "Error en sincronización de BD"
    }
    
    # 7. VERIFICAR ESTADO FINAL
    Log-Info "Verificando estado final..."
    node verificar-simple.js
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Verificación exitosa"
    } else {
        Log-Warning "Verificación con problemas, revisar logs"
    }
    
    # 8. REINICIAR SERVICIOS (si usa PM2)
    if (Get-Command pm2 -ErrorAction SilentlyContinue) {
        Log-Info "Reiniciando aplicación con PM2..."
        pm2 restart parroquia-api
        if ($LASTEXITCODE -ne 0) {
            pm2 start ecosystem.config.cjs
        }
        Log-Success "Aplicación reiniciada"
    } else {
        Log-Warning "PM2 no encontrado. Reinicia el servidor manualmente."
    }
    
    # 9. VERIFICAR QUE EL SERVIDOR RESPONDA
    Log-Info "Verificando que el servidor responda..."
    Start-Sleep -Seconds 5
    
    $serverResponding = $false
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Log-Success "Servidor respondiendo en puerto 3000"
            $serverResponding = $true
        }
    } catch {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Log-Success "Servidor respondiendo en puerto 5000"
                $serverResponding = $true
            }
        } catch {
            Log-Warning "Servidor no responde en puertos comunes, verificar manualmente"
        }
    }
    
    # 10. RESUMEN FINAL
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT COMPLETADO" -ForegroundColor Green
    Write-Host "========================" -ForegroundColor Green
    Log-Success "Código actualizado desde rama feature"
    Log-Success "Base de datos sincronizada"
    Log-Success "Dependencias instaladas"
    if (-not $SkipBackup) {
        Log-Success "Backup creado en: $BackupDir"
    }
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Blue
    Write-Host "1. Verificar que la aplicación funcione correctamente"
    Write-Host "2. Probar APIs críticas (especialmente /api/catalog/veredas)"
    Write-Host "3. Monitorear logs por posibles errores"
    Write-Host ""
    Write-Host "🔗 URLs para probar:" -ForegroundColor Blue
    Write-Host "- Health check: http://tu-servidor:3000/health"
    Write-Host "- API Veredas: http://tu-servidor:3000/api/catalog/veredas"
    Write-Host ""
    Log-Success "Deployment finalizado: $(Get-Date)"
    
} catch {
    Log-Error "Error durante el deployment: $($_.Exception.Message)"
    
    if (-not $SkipBackup -and $BackupDir) {
        Write-Host ""
        Log-Info "En caso de problemas, puedes restaurar desde: $BackupDir"
    }
    
    Write-Host ""
    Write-Host "🔄 Para restaurar manualmente:" -ForegroundColor Yellow
    Write-Host "1. git checkout HEAD~1  # Volver al commit anterior"
    Write-Host "2. Restaurar BD desde backup si es necesario"
    Write-Host "3. npm install"
    Write-Host "4. Reiniciar servidor"
    
    exit 1
}
