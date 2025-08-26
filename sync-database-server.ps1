# 🔄 SCRIPT DE SINCRONIZACIÓN DE BASE DE DATOS PARA SERVIDOR (Windows)
# Este script sincroniza la BD del servidor con los cambios locales
# Versión: 1.0

param(
    [string]$Mode = "complete"
)

Write-Host "🔄 SINCRONIZACIÓN DE BASE DE DATOS EN SERVIDOR" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "📅 Fecha: $(Get-Date)" -ForegroundColor Blue
Write-Host "💻 Servidor: $env:COMPUTERNAME" -ForegroundColor Blue
Write-Host ""

function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Error "No estás en el directorio del proyecto. Busca el directorio que contiene package.json"
    exit 1
}

Write-Info "Directorio del proyecto: $(Get-Location)"

# Verificar que existe archivo .env
if (-not (Test-Path ".env")) {
    Write-Error "Archivo .env no encontrado. Se requiere para conectar a la BD."
    exit 1
}

# Cargar variables de entorno del archivo .env
$envContent = Get-Content ".env"
foreach ($line in $envContent) {
    if ($line -match "^([^#][^=]*?)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Write-Host ""
Write-Host "🗄️  INFORMACIÓN DE CONEXIÓN:" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host "Base de datos: $($env:DB_NAME)"
Write-Host "Host: $($env:DB_HOST)"
Write-Host "Usuario: $($env:DB_USER)"
Write-Host "Puerto: $($env:DB_PORT)"
Write-Host ""

# Si no se especificó modo, preguntar
if ($Mode -eq "complete") {
    Write-Host "🔧 OPCIONES DE SINCRONIZACIÓN:" -ForegroundColor Yellow
    Write-Host "=============================" -ForegroundColor Yellow
    Write-Host "1. Sincronización completa (Recomendado)"
    Write-Host "2. Solo agregar nuevas columnas"
    Write-Host "3. Verificar estado actual"
    Write-Host "4. Sincronización forzada (¡PELIGROSO!)"
    Write-Host ""
    
    $choice = Read-Host "Selecciona una opción (1-4) [default: 1]"
    if ([string]::IsNullOrEmpty($choice)) { $choice = "1" }
    
    switch ($choice) {
        "1" { $Mode = "complete"; Write-Host "🔄 Ejecutando sincronización completa..." }
        "2" { $Mode = "add_only"; Write-Host "➕ Ejecutando solo nuevas columnas..." }
        "3" { $Mode = "verify_only"; Write-Host "🔍 Verificando estado actual..." }
        "4" { 
            $confirm = Read-Host "⚠️  ¿Estás seguro de hacer sincronización forzada? (escribe 'CONFIRMO')"
            if ($confirm -eq "CONFIRMO") {
                $Mode = "force"
                Write-Host "🚨 Ejecutando sincronización forzada..."
            } else {
                Write-Host "Sincronización forzada cancelada"
                exit 1
            }
        }
        default { $Mode = "complete"; Write-Host "Opción inválida, usando sincronización completa" }
    }
}

# Crear script de sincronización temporal
$syncScript = @"
import sequelize from './config/sequelize.js';

const syncDatabase = async () => {
  const syncMode = '$Mode';
  
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    const [dbInfo] = await sequelize.query(\`
      SELECT current_database() as db_name, 
             current_user as db_user,
             version() as db_version;
    \`);
    
    console.log(\`📊 BD: \${dbInfo[0].db_name} | Usuario: \${dbInfo[0].db_user}\`);
    console.log(\`🐘 PostgreSQL: \${dbInfo[0].db_version.split(' ')[0]} \${dbInfo[0].db_version.split(' ')[1]}\`);
    console.log('');

    if (syncMode === 'verify_only') {
      console.log('🔍 VERIFICANDO ESTADO ACTUAL...');
      console.log('==============================');
      
      // Verificar tablas principales
      const [tables] = await sequelize.query(\`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_name IN ('familias', 'personas', 'usuarios', 'municipios', 'departamentos', 'sectores', 'veredas')
        ORDER BY table_name;
      \`);
      
      console.log('📋 Tablas principales:');
      tables.forEach(table => {
        console.log(\`  📁 \${table.table_name}: \${table.column_count} columnas\`);
      });
      
      // Verificar campo comunionEnCasa específicamente
      const [comunionField] = await sequelize.query(\`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'familias' 
        AND LOWER(column_name) LIKE '%comunion%';
      \`);
      
      if (comunionField.length > 0) {
        console.log('\\n✅ Campo comunionEnCasa encontrado:');
        comunionField.forEach(field => {
          console.log(\`   - \${field.column_name} (\${field.data_type}) - Default: \${field.column_default}\`);
        });
      } else {
        console.log('\\n❌ Campo comunionEnCasa NO encontrado');
      }
      
      // Verificar datos existentes
      const [familiaCount] = await sequelize.query('SELECT COUNT(*) as count FROM familias');
      const [personaCount] = await sequelize.query('SELECT COUNT(*) as count FROM personas');
      const [usuarioCount] = await sequelize.query('SELECT COUNT(*) as count FROM usuarios');
      
      console.log('\\n📊 Datos existentes:');
      console.log(\`   👨‍👩‍👧‍👦 Familias: \${familiaCount[0].count}\`);
      console.log(\`   👤 Personas: \${personaCount[0].count}\`);
      console.log(\`   👥 Usuarios: \${usuarioCount[0].count}\`);
      
    } else if (syncMode === 'add_only') {
      console.log('➕ AGREGANDO SOLO NUEVAS COLUMNAS...');
      console.log('====================================');
      
      // Verificar y agregar campo comunionEnCasa si no existe
      const [comunionExists] = await sequelize.query(\`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'familias' 
        AND LOWER(column_name) LIKE '%comunion%';
      \`);
      
      if (comunionExists.length === 0) {
        console.log('➕ Agregando campo comunionEnCasa...');
        await sequelize.query(\`
          ALTER TABLE familias 
          ADD COLUMN "comunionEnCasa" BOOLEAN DEFAULT FALSE;
        \`);
        
        await sequelize.query(\`
          COMMENT ON COLUMN familias."comunionEnCasa" 
          IS 'Indica si la familia realiza comunión en casa';
        \`);
        
        console.log('✅ Campo comunionEnCasa agregado');
      } else {
        console.log('ℹ️  Campo comunionEnCasa ya existe');
      }
      
      console.log('✅ Agregado de nuevas columnas completado');
      
    } else if (syncMode === 'complete') {
      console.log('🔄 SINCRONIZACIÓN COMPLETA...');
      console.log('=============================');
      
      // Sincronización con alter: true (seguro)
      console.log('🔄 Sincronizando modelos...');
      await sequelize.sync({ alter: true });
      console.log('✅ Sincronización con alter completada');
      
      // Verificar que la sincronización fue exitosa
      console.log('🔍 Verificando resultado...');
      const [finalCheck] = await sequelize.query(\`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'familias' 
        AND LOWER(column_name) LIKE '%comunion%';
      \`);
      
      if (finalCheck.length > 0) {
        console.log('✅ Verificación exitosa - Campo comunionEnCasa presente');
      }
      
    } else if (syncMode === 'force') {
      console.log('🚨 SINCRONIZACIÓN FORZADA...');
      console.log('============================');
      console.log('⚠️  ATENCIÓN: Esto puede eliminar datos si hay conflictos');
      
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Sincronización forzada completada');
    }
    
    await sequelize.close();
    console.log('\\n🎉 Sincronización de base de datos completada exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.split('\\n').slice(0, 5).join('\\n'));
    }
    process.exit(1);
  }
};

syncDatabase();
"@

# Escribir el script temporal
$syncScript | Out-File -FilePath "sync_database_temp.mjs" -Encoding UTF8

# Ejecutar sincronización
Write-Info "Ejecutando sincronización de base de datos..."
$result = Start-Process -FilePath "node" -ArgumentList "sync_database_temp.mjs" -Wait -PassThru -NoNewWindow

# Limpiar archivo temporal
Remove-Item "sync_database_temp.mjs" -Force -ErrorAction SilentlyContinue

if ($result.ExitCode -eq 0) {
    Write-Success "🎉 Sincronización completada exitosamente"
    
    Write-Host ""
    Write-Host "🔧 PRÓXIMOS PASOS RECOMENDADOS:" -ForegroundColor Yellow
    Write-Host "===============================" -ForegroundColor Yellow
    Write-Host "1. Verificar que la aplicación funcione correctamente"
    Write-Host "2. Probar los endpoints de la API"
    Write-Host "3. Verificar que el campo comunionEnCasa funcione en formularios"
    Write-Host ""
    Write-Host "📊 COMANDOS ÚTILES:" -ForegroundColor Yellow
    Write-Host "=================="
    Write-Host "• Verificar logs: pm2 logs parroquia-api"
    Write-Host "• Reiniciar app: pm2 restart parroquia-api"
    Write-Host "• Estado app: pm2 status"
    Write-Host ""
    Write-Host "🧪 PRUEBAS RECOMENDADAS:" -ForegroundColor Yellow
    Write-Host "======================="
    Write-Host "• Crear una familia nueva con comunionEnCasa=true"
    Write-Host "• Verificar validación de miembros únicos"
    Write-Host "• Probar endpoints de encuestas"
    
} else {
    Write-Error "❌ Error en la sincronización"
    Write-Host ""
    Write-Host "🔧 SOLUCIÓN DE PROBLEMAS:" -ForegroundColor Yellow
    Write-Host "========================"
    Write-Host "1. Verificar variables en .env"
    Write-Host "2. Verificar conectividad a BD"
    Write-Host "3. Verificar permisos de usuario de BD"
    Write-Host "4. Revisar logs detallados arriba"
}

Write-Host ""
Write-Info "Script de sincronización finalizado: $(Get-Date)"
