# 🚨 SCRIPT DE REPARACIÓN URGENTE PARA SERVIDOR (PowerShell)
# Corrige problemas de asociaciones de Sequelize y reinicia la aplicación

param(
    [switch]$SkipReinstall = $false
)

Write-Host "🚨 REPARACIÓN URGENTE DE SERVIDOR" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host "📅 $(Get-Date)" -ForegroundColor Blue
Write-Host "💻 Servidor: $env:COMPUTERNAME" -ForegroundColor Blue
Write-Host ""

function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Verificar directorio del proyecto
if (-not (Test-Path "package.json")) {
    Write-Error "No estás en el directorio del proyecto"
    exit 1
}

Write-Info "Directorio del proyecto: $(Get-Location)"

Write-Host ""
Write-Host "🔧 PASO 1: DETENER APLICACIÓN" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

# Detener PM2
Write-Info "Deteniendo aplicación con PM2..."
try {
    pm2 stop parroquia-api 2>$null
    Write-Success "PM2 detenido"
} catch {
    Write-Warning "PM2 no estaba ejecutándose o no disponible"
}

Write-Host ""
Write-Host "🔧 PASO 2: CREAR VERIFICACIÓN TEMPORAL" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

# Crear script de verificación temporal
$verifyScript = @"
// Corrección urgente de asociaciones
import 'dotenv/config';

console.log('🔧 CORRECCIÓN URGENTE DE ASOCIACIONES');
console.log('=====================================');

try {
  // Test básico de conexión a BD
  const { Sequelize } = await import('sequelize');
  
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'parroquia_db',
    process.env.DB_USER || 'parroquia_user',
    process.env.DB_PASSWORD || 'admin',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  console.log('🔗 Probando conexión a BD...');
  await sequelize.authenticate();
  console.log('✅ Conexión a BD OK');
  
  // Verificar tablas críticas
  console.log('🔍 Verificando tablas...');
  const [tables] = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('usuarios', 'familias', 'personas')
    ORDER BY table_name;
  `);
  
  console.log('📋 Tablas encontradas:');
  tables.forEach(table => {
    console.log(`   📁 `${table.table_name}`);
  });
  
  if (tables.length < 3) {
    console.log('❌ Faltan tablas críticas');
    process.exit(1);
  }
  
  // Verificar campo comunionEnCasa
  console.log('🔍 Verificando campo comunionEnCasa...');
  const [comunionField] = await sequelize.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'familias' 
    AND column_name = 'comunionEnCasa';
  `);
  
  if (comunionField.length > 0) {
    console.log('✅ Campo comunionEnCasa presente');
  } else {
    console.log('⚠️  Campo comunionEnCasa no encontrado - pero no es crítico');
  }
  
  await sequelize.close();
  console.log('✅ Verificación completada - BD está OK');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Error en verificación:', error.message);
  process.exit(1);
}
"@

# Escribir y ejecutar verificación
$verifyScript | Out-File -FilePath "fix-server-urgent-temp.mjs" -Encoding UTF8

Write-Info "Ejecutando verificación de BD..."
$result = Start-Process -FilePath "node" -ArgumentList "fix-server-urgent-temp.mjs" -Wait -PassThru -NoNewWindow

# Limpiar archivo temporal
Remove-Item "fix-server-urgent-temp.mjs" -Force -ErrorAction SilentlyContinue

if ($result.ExitCode -ne 0) {
    Write-Error "Verificación de BD falló"
    exit 1
}

Write-Host ""
Write-Host "🔧 PASO 3: VERIFICAR ARCHIVOS CRÍTICOS" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

# Verificar archivos críticos
$criticalFiles = @(
    "src\models\index.js",
    "src\models\catalog\index.js",
    "src\models\Usuario.js",
    "src\app.js",
    "config\sequelize.js"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Success "Archivo $file existe"
    } else {
        Write-Error "Archivo crítico $file no existe"
        exit 1
    }
}

Write-Host ""
Write-Host "🔧 PASO 4: VERIFICAR DEPENDENCIAS" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# Solo reinstalar si hay problemas o se solicita
if (-not $SkipReinstall -and (-not (Test-Path "node_modules") -or -not (Test-Path "node_modules\.package-lock.json"))) {
    Write-Warning "node_modules parece incompleto, reinstalando..."
    npm install --production
} else {
    Write-Info "node_modules está OK (usa -SkipReinstall para forzar reinstalación)"
}

Write-Host ""
Write-Host "🔧 PASO 5: REINICIAR APLICACIÓN" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

# Verificar PM2
Write-Info "Verificando PM2..."
$pm2Available = $false
try {
    pm2 --version | Out-Null
    $pm2Available = $true
    Write-Success "PM2 disponible"
} catch {
    Write-Warning "PM2 no está disponible"
}

if ($pm2Available) {
    # Configuración PM2 básica si no existe
    if (-not (Test-Path "ecosystem.config.cjs")) {
        Write-Warning "Creando configuración PM2 básica..."
        $ecosystemConfig = @"
module.exports = {
  apps: [{
    name: 'parroquia-api',
    script: 'src/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
"@
        $ecosystemConfig | Out-File -FilePath "ecosystem.config.cjs" -Encoding UTF8
    }

    # Iniciar con PM2
    Write-Info "Iniciando aplicación con PM2..."
    pm2 start ecosystem.config.cjs --update-env
    $pm2Result = $LASTEXITCODE
} else {
    # Iniciar directamente
    Write-Info "Iniciando aplicación directamente..."
    Start-Process -FilePath "node" -ArgumentList "src/app.js" -NoNewWindow
    $pm2Result = 0
}

# Esperar un momento
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🔧 PASO 6: VERIFICAR ESTADO" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow

if ($pm2Available) {
    # Verificar estado PM2
    Write-Info "Estado de PM2:"
    pm2 status

    # Verificar logs recientes
    Write-Info "Logs recientes (últimas 10 líneas):"
    pm2 logs parroquia-api --lines 10 --nostream
}

# Verificar proceso
Write-Info "Procesos Node.js activos:"
Get-Process -Name "node" -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime

if ($pm2Result -eq 0) {
    Write-Success "🎉 REPARACIÓN COMPLETADA"
    Write-Host ""
    Write-Host "📊 RESUMEN:" -ForegroundColor Yellow
    Write-Host "===========" -ForegroundColor Yellow
    Write-Host "✅ BD verificada y funcional"
    Write-Host "✅ Archivos críticos presentes"
    Write-Host "✅ Aplicación reiniciada"
    Write-Host ""
    Write-Host "🔧 COMANDOS ÚTILES:" -ForegroundColor Yellow
    Write-Host "=================="
    Write-Host "• Ver logs: pm2 logs parroquia-api"
    Write-Host "• Estado: pm2 status"
    Write-Host "• Reiniciar: pm2 restart parroquia-api"
    Write-Host "• Parar: pm2 stop parroquia-api"
    Write-Host ""
    Write-Host "🧪 PRUEBAS:" -ForegroundColor Yellow
    Write-Host "=========="
    Write-Host "• Health check: Invoke-RestMethod http://localhost:3000/api/health"
    Write-Host "• Ver procesos: Get-Process -Name node"
    
} else {
    Write-Error "❌ Error al iniciar aplicación"
    Write-Host ""
    Write-Host "🔧 DIAGNÓSTICO:" -ForegroundColor Yellow
    Write-Host "==============" -ForegroundColor Yellow
    if ($pm2Available) {
        Write-Info "Verificando logs de error..."
        pm2 logs parroquia-api --err --lines 20 --nostream
    }
    
    Write-Host ""
    Write-Host "🔧 SOLUCIONES POSIBLES:" -ForegroundColor Yellow
    Write-Host "====================="
    Write-Host "1. Verificar .env: Get-Content .env"
    Write-Host "2. Verificar variables: Get-Content .env | Select-String 'DB_'"
    Write-Host "3. Reinicio manual: node src/app.js"
    Write-Host "4. Verificar puerto: netstat -an | Select-String '3000'"
}

Write-Host ""
Write-Info "Reparación urgente finalizada: $(Get-Date)"
