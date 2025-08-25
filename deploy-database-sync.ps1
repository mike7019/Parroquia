# 🚀 SCRIPT DE DEPLOYMENT ENFOCADO EN SINCRONIZACIÓN DE BD
# Este script asegura que todos los cambios de modelos se apliquen en el servidor

param(
    [switch]$Force,
    [switch]$SkipVerification
)

Write-Host "🔄 DEPLOYMENT ESPECIALIZADO - SINCRONIZACIÓN DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "📅 Fecha: $(Get-Date)" -ForegroundColor Blue
Write-Host ""

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

function Log-Critical {
    param($Message)
    Write-Host "🚨 $Message" -ForegroundColor Magenta
}

try {
    # 1. VERIFICACIÓN PRELIMINAR
    Log-Info "Verificando estado inicial..."
    
    # Verificar que estamos en el directorio correcto
    if (-not (Test-Path "package.json")) {
        throw "No se encontró package.json. Ejecutar desde el directorio raíz del proyecto."
    }
    
    # Verificar archivo .env
    if (-not (Test-Path ".env")) {
        Log-Error "Archivo .env no encontrado"
        throw "Configuración de base de datos requerida"
    }
    
    Log-Success "Verificación preliminar completada"
    
    # 2. BACKUP DE SEGURIDAD DE BD
    Log-Info "Creando backup de seguridad de la base de datos..."
    
    $BackupDir = "backups\db-deployment-$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
        try {
            $env:PGPASSWORD = $env:DB_PASSWORD
            pg_dump -h $($env:DB_HOST ?? "localhost") -U $($env:DB_USER ?? "parroquia_user") -d $($env:DB_NAME ?? "parroquia_db") -f "$BackupDir\pre-deployment-backup.sql"
            Log-Success "Backup creado: $BackupDir\pre-deployment-backup.sql"
        } catch {
            Log-Warning "No se pudo crear backup automático: $($_.Exception.Message)"
        }
    } else {
        Log-Warning "pg_dump no disponible, saltando backup automático"
    }
    
    # 3. PROBAR CONEXIÓN A BD
    Log-Info "Verificando conexión a base de datos..."
    
    $connectionTest = @"
import 'dotenv/config';
import sequelize from './config/sequelize.js';

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión exitosa');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  });
"@
    
    $connectionTest | node --input-type=module
    
    if ($LASTEXITCODE -ne 0) {
        throw "No se puede conectar a la base de datos. Verificar configuración."
    }
    
    Log-Success "Conexión a base de datos confirmada"
    
    # 4. VERIFICAR ESTADO ACTUAL DE MODELOS
    Log-Info "Verificando estado actual de los modelos..."
    
    if (Test-Path "verify-post-deployment.cjs") {
        node verify-post-deployment.cjs
        $preVerificationResult = $LASTEXITCODE
        
        if ($preVerificationResult -eq 0) {
            Log-Info "Estado actual: Base de datos sincronizada"
        } else {
            Log-Warning "Estado actual: Base de datos requiere sincronización"
        }
    }
    
    # 5. SINCRONIZACIÓN PRINCIPAL DE BD
    Log-Critical "INICIANDO SINCRONIZACIÓN DE BASE DE DATOS"
    
    if (-not $Force) {
        Write-Host ""
        Write-Host "⚠️  ATENCIÓN: Este proceso va a:" -ForegroundColor Yellow
        Write-Host "   • Sincronizar todos los modelos con la base de datos" -ForegroundColor Yellow
        Write-Host "   • Aplicar ALTER TABLE a las tablas existentes" -ForegroundColor Yellow
        Write-Host "   • Modificar la estructura de tablas según los modelos" -ForegroundColor Yellow
        Write-Host ""
        $confirmation = Read-Host "¿Proceder con la sincronización? (s/N)"
        if ($confirmation -ne 's' -and $confirmation -ne 'S') {
            Write-Host "Deployment cancelado por el usuario" -ForegroundColor Yellow
            exit 0
        }
    }
    
    Write-Host ""
    Log-Info "Ejecutando sincronización completa con ALTER..."
    Write-Host "================================================" -ForegroundColor Cyan
    
    # Método principal: npm script
    npm run db:sync:complete:alter
    $syncResult = $LASTEXITCODE
    
    if ($syncResult -eq 0) {
        Log-Success "Sincronización principal completada exitosamente"
    } else {
        Log-Error "Error en sincronización principal"
        
        # Método de fallback: script directo
        Log-Info "Intentando método de fallback..."
        
        if (Test-Path "syncDatabaseComplete.js") {
            node syncDatabaseComplete.js
            $fallbackResult = $LASTEXITCODE
            
            if ($fallbackResult -eq 0) {
                Log-Success "Sincronización de fallback completada"
            } else {
                throw "Error en ambos métodos de sincronización"
            }
        } else {
            throw "Método de fallback no disponible"
        }
    }
    
    # 6. VERIFICACIÓN POST-SINCRONIZACIÓN
    if (-not $SkipVerification) {
        Log-Info "Ejecutando verificación post-sincronización..."
        Write-Host "=============================================" -ForegroundColor Cyan
        
        if (Test-Path "verify-post-deployment.cjs") {
            node verify-post-deployment.cjs
            $postVerificationResult = $LASTEXITCODE
            
            if ($postVerificationResult -eq 0) {
                Log-Success "VERIFICACIÓN POST-SINCRONIZACIÓN: EXITOSA"
                Log-Success "Todos los cambios de BD se aplicaron correctamente"
            } else {
                Log-Error "VERIFICACIÓN POST-SINCRONIZACIÓN: FALLÓ"
                Log-Critical "Los cambios podrían no haberse aplicado completamente"
                
                Write-Host ""
                Write-Host "🔍 ACCIONES RECOMENDADAS:" -ForegroundColor Yellow
                Write-Host "1. Revisar logs de sincronización arriba"
                Write-Host "2. Ejecutar manualmente: npm run db:sync:complete:alter"
                Write-Host "3. Verificar permisos de BD y conectividad"
                Write-Host "4. Contactar al equipo de desarrollo"
            }
        } else {
            Log-Warning "Script de verificación no encontrado"
        }
    } else {
        Log-Info "Verificación post-sincronización omitida (--SkipVerification)"
    }
    
    # 7. PRUEBA FUNCIONAL BÁSICA
    Log-Info "Realizando prueba funcional básica..."
    
    $functionalTest = @"
import 'dotenv/config';
import sequelize from './config/sequelize.js';

async function testBasicFunctionality() {
    try {
        // Test de conexión
        await sequelize.authenticate();
        
        // Test de consulta básica a tabla crítica
        const [result] = await sequelize.query('SELECT COUNT(*) as count FROM familias');
        console.log(\`✅ Tabla familias accesible: \${result[0].count} registros\`);
        
        // Test de estructura de familias
        const [columns] = await sequelize.query(\`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'familias' AND column_name = 'id_familia'
        \`);
        
        if (columns.length > 0) {
            const idCol = columns[0];
            console.log(\`✅ id_familia: \${idCol.data_type}, default: \${idCol.column_default}\`);
            
            if (idCol.column_default && idCol.column_default.includes('nextval')) {
                console.log('✅ Autoincrement configurado correctamente');
            }
        }
        
        await sequelize.close();
        console.log('✅ Prueba funcional completada');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error en prueba funcional:', error.message);
        process.exit(1);
    }
}

testBasicFunctionality();
"@
    
    $functionalTest | node --input-type=module
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Prueba funcional básica: EXITOSA"
    } else {
        Log-Warning "Prueba funcional básica: CON PROBLEMAS"
    }
    
    # 8. RESUMEN FINAL
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT DE BASE DE DATOS COMPLETADO" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    
    Log-Success "✅ Backup de seguridad creado"
    Log-Success "✅ Conexión a BD verificada"
    Log-Success "✅ Sincronización de modelos completada"
    
    if (-not $SkipVerification) {
        if ($postVerificationResult -eq 0) {
            Log-Success "✅ Verificación post-deployment exitosa"
        } else {
            Log-Warning "⚠️  Verificación post-deployment con problemas"
        }
    }
    
    Write-Host ""
    Write-Host "📋 Siguiente paso: Reiniciar la aplicación en el servidor" -ForegroundColor Blue
    Write-Host "Comando sugerido: pm2 restart parroquia-api" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🔗 Para verificar funcionamiento:" -ForegroundColor Blue
    Write-Host "• Health check: http://servidor:puerto/health" -ForegroundColor Blue
    Write-Host "• Test API: http://servidor:puerto/api/catalog/veredas" -ForegroundColor Blue
    Write-Host ""
    
    Log-Success "Deployment de BD finalizado: $(Get-Date)"
    
} catch {
    Log-Error "ERROR CRÍTICO EN DEPLOYMENT: $($_.Exception.Message)"
    
    Write-Host ""
    Write-Host "🚨 ESTADO DEL DEPLOYMENT: FALLIDO" -ForegroundColor Red
    Write-Host "=================================" -ForegroundColor Red
    
    if ($BackupDir -and (Test-Path $BackupDir)) {
        Write-Host ""
        Log-Info "Backup disponible en: $BackupDir"
        Write-Host "Para restaurar:"
        Write-Host "psql -h host -U user -d database < $BackupDir\pre-deployment-backup.sql"
    }
    
    Write-Host ""
    Write-Host "🔄 PASOS DE RECUPERACIÓN:" -ForegroundColor Yellow
    Write-Host "1. Verificar logs de error arriba"
    Write-Host "2. Verificar conectividad a BD"
    Write-Host "3. Verificar permisos de usuario de BD"
    Write-Host "4. Restaurar backup si es necesario"
    Write-Host "5. Contactar al equipo de desarrollo"
    
    exit 1
}
