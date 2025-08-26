#!/bin/bash

# 🔄 SCRIPT DE SINCRONIZACIÓN DE BASE DE DATOS PARA SERVIDOR
# Este script sincroniza la BD del servidor con los cambios locales
# Versión: 1.0

echo "🔄 SINCRONIZACIÓN DE BASE DE DATOS EN SERVIDOR"
echo "=============================================="
echo "📅 Fecha: $(date)"
echo "🌍 Servidor: $(hostname)"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No estás en el directorio del proyecto. Busca el directorio que contiene package.json"
    exit 1
fi

log_info "Directorio del proyecto: $(pwd)"

# Verificar que existe archivo .env
if [ ! -f ".env" ]; then
    log_error "Archivo .env no encontrado. Se requiere para conectar a la BD."
    exit 1
fi

# Cargar variables de entorno
source .env

echo ""
echo "🗄️  INFORMACIÓN DE CONEXIÓN:"
echo "============================"
echo "Base de datos: ${DB_NAME:-'No definida'}"
echo "Host: ${DB_HOST:-'No definido'}"
echo "Usuario: ${DB_USER:-'No definido'}"
echo "Puerto: ${DB_PORT:-'No definido'}"
echo ""

# Opciones de sincronización
echo "🔧 OPCIONES DE SINCRONIZACIÓN:"
echo "============================="
echo "1. Sincronización completa (Recomendado)"
echo "2. Solo agregar nuevas columnas"
echo "3. Verificar estado actual"
echo "4. Sincronización forzada (¡PELIGROSO!)"
echo ""
echo "Selecciona una opción (1-4):"
read -t 30 option

if [ -z "$option" ]; then
    option="1"
    echo "Timeout - usando opción 1 (Sincronización completa)"
fi

case $option in
    1)
        echo "🔄 Ejecutando sincronización completa..."
        SYNC_MODE="complete"
        ;;
    2)
        echo "➕ Ejecutando solo nuevas columnas..."
        SYNC_MODE="add_only"
        ;;
    3)
        echo "🔍 Verificando estado actual..."
        SYNC_MODE="verify_only"
        ;;
    4)
        echo "⚠️  ¿Estás seguro de hacer sincronización forzada? (escribe 'CONFIRMO'):"
        read confirmation
        if [ "$confirmation" = "CONFIRMO" ]; then
            SYNC_MODE="force"
            echo "🚨 Ejecutando sincronización forzada..."
        else
            echo "Sincronización forzada cancelada"
            exit 1
        fi
        ;;
    *)
        echo "Opción inválida, usando sincronización completa"
        SYNC_MODE="complete"
        ;;
esac

# Crear script de sincronización según el modo seleccionado
cat > sync_database.mjs << EOF
import sequelize from './config/sequelize.js';

const syncDatabase = async () => {
  const syncMode = '${SYNC_MODE}';
  
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
      
      // Aquí puedes agregar más campos nuevos si los tienes
      console.log('✅ Agregado de nuevas columnas completado');
      
    } else if (syncMode === 'complete') {
      console.log('🔄 SINCRONIZACIÓN COMPLETA...');
      console.log('=============================');
      
      // Backup de seguridad antes de sincronizar
      console.log('💾 Creando backup de seguridad...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      try {
        const { exec } = await import('child_process');
        const util = await import('util');
        const execPromise = util.promisify(exec);
        
        const backupFile = \`backup_\${timestamp}.sql\`;
        const backupCmd = \`pg_dump -h \${process.env.DB_HOST} -U \${process.env.DB_USER} -d \${process.env.DB_NAME} --no-owner --no-privileges > \${backupFile}\`;
        
        await execPromise(backupCmd);
        console.log(\`✅ Backup creado: \${backupFile}\`);
      } catch (backupError) {
        console.log('⚠️  No se pudo crear backup automático:', backupError.message);
        console.log('   Continuando sin backup...');
      }
      
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
      
      // Sincronización forzada (puede eliminar datos)
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
EOF

# Ejecutar sincronización
log_info "Ejecutando sincronización de base de datos..."
node sync_database.mjs
RESULT=$?

# Limpiar archivo temporal
rm -f sync_database.mjs

if [ $RESULT -eq 0 ]; then
    log_success "🎉 Sincronización completada exitosamente"
    
    echo ""
    echo "🔧 PRÓXIMOS PASOS RECOMENDADOS:"
    echo "==============================="
    echo "1. Verificar que la aplicación funcione correctamente"
    echo "2. Probar los endpoints de la API"
    echo "3. Verificar que el campo comunionEnCasa funcione en formularios"
    echo ""
    echo "📊 COMANDOS ÚTILES:"
    echo "=================="
    echo "• Verificar logs: pm2 logs parroquia-api"
    echo "• Reiniciar app: pm2 restart parroquia-api"
    echo "• Estado app: pm2 status"
    echo ""
    echo "🧪 PRUEBAS RECOMENDADAS:"
    echo "======================="
    echo "• Crear una familia nueva con comunionEnCasa=true"
    echo "• Verificar validación de miembros únicos"
    echo "• Probar endpoints de encuestas"
    
else
    log_error "❌ Error en la sincronización"
    echo ""
    echo "🔧 SOLUCIÓN DE PROBLEMAS:"
    echo "========================"
    echo "1. Verificar variables en .env"
    echo "2. Verificar conectividad a BD"
    echo "3. Verificar permisos de usuario de BD"
    echo "4. Revisar logs detallados arriba"
fi

echo ""
log_info "Script de sincronización finalizado: $(date)"
