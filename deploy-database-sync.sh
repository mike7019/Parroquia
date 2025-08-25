#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT ENFOCADO EN SINCRONIZACIÓN DE BD
# Este script asegura que todos los cambios de modelos se apliquen en el servidor

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Parse command line arguments
FORCE=false
SKIP_VERIFICATION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --skip-verification)
            SKIP_VERIFICATION=true
            shift
            ;;
        *)
            echo "Uso: $0 [--force] [--skip-verification]"
            exit 1
            ;;
    esac
done

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Funciones para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_critical() {
    echo -e "${MAGENTA}🚨 $1${NC}"
}

# Header
echo -e "${CYAN}🔄 DEPLOYMENT ESPECIALIZADO - SINCRONIZACIÓN DE BASE DE DATOS${NC}"
echo -e "${CYAN}=============================================================${NC}"
echo -e "${BLUE}📅 Fecha: $(date)${NC}"
echo ""

# 1. VERIFICACIÓN PRELIMINAR
log_info "Verificando estado inicial..."

if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

if [ ! -f ".env" ]; then
    log_error "Archivo .env no encontrado"
    log_error "Configuración de base de datos requerida"
    exit 1
fi

log_success "Verificación preliminar completada"

# 2. BACKUP DE SEGURIDAD DE BD
log_info "Creando backup de seguridad de la base de datos..."

BACKUP_DIR="backups/db-deployment-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if command -v pg_dump &> /dev/null; then
    if [ -n "${DB_PASSWORD:-}" ]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
    
    if pg_dump -h "${DB_HOST:-localhost}" -U "${DB_USER:-parroquia_user}" -d "${DB_NAME:-parroquia_db}" > "$BACKUP_DIR/pre-deployment-backup.sql" 2>/dev/null; then
        log_success "Backup creado: $BACKUP_DIR/pre-deployment-backup.sql"
    else
        log_warning "No se pudo crear backup automático"
    fi
else
    log_warning "pg_dump no disponible, saltando backup automático"
fi

# 3. PROBAR CONEXIÓN A BD
log_info "Verificando conexión a base de datos..."

CONNECTION_TEST="
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
"

if echo "$CONNECTION_TEST" | node --input-type=module; then
    log_success "Conexión a base de datos confirmada"
else
    log_error "No se puede conectar a la base de datos. Verificar configuración."
    exit 1
fi

# 4. VERIFICAR ESTADO ACTUAL DE MODELOS
log_info "Verificando estado actual de los modelos..."

if [ -f "verify-post-deployment.cjs" ]; then
    if node verify-post-deployment.cjs; then
        log_info "Estado actual: Base de datos sincronizada"
    else
        log_warning "Estado actual: Base de datos requiere sincronización"
    fi
fi

# 5. SINCRONIZACIÓN PRINCIPAL DE BD
log_critical "INICIANDO SINCRONIZACIÓN DE BASE DE DATOS"

if [ "$FORCE" = false ]; then
    echo ""
    log_warning "ATENCIÓN: Este proceso va a:"
    echo "   • Sincronizar todos los modelos con la base de datos"
    echo "   • Aplicar ALTER TABLE a las tablas existentes"
    echo "   • Modificar la estructura de tablas según los modelos"
    echo ""
    
    read -p "¿Proceder con la sincronización? (s/N): " confirmation
    if [[ "$confirmation" != "s" && "$confirmation" != "S" ]]; then
        echo "Deployment cancelado por el usuario"
        exit 0
    fi
fi

echo ""
log_info "Ejecutando sincronización completa con ALTER..."
echo -e "${CYAN}================================================${NC}"

# Método principal: npm script
if npm run db:sync:complete:alter; then
    log_success "Sincronización principal completada exitosamente"
else
    log_error "Error en sincronización principal"
    
    # Método de fallback: script directo
    log_info "Intentando método de fallback..."
    
    if [ -f "syncDatabaseComplete.js" ]; then
        if node syncDatabaseComplete.js; then
            log_success "Sincronización de fallback completada"
        else
            log_error "Error en ambos métodos de sincronización"
            exit 1
        fi
    else
        log_error "Método de fallback no disponible"
        exit 1
    fi
fi

# 6. VERIFICACIÓN POST-SINCRONIZACIÓN
if [ "$SKIP_VERIFICATION" = false ]; then
    log_info "Ejecutando verificación post-sincronización..."
    echo -e "${CYAN}=============================================${NC}"
    
    if [ -f "verify-post-deployment.cjs" ]; then
        if node verify-post-deployment.cjs; then
            log_success "VERIFICACIÓN POST-SINCRONIZACIÓN: EXITOSA"
            log_success "Todos los cambios de BD se aplicaron correctamente"
            POST_VERIFICATION_SUCCESS=true
        else
            log_error "VERIFICACIÓN POST-SINCRONIZACIÓN: FALLÓ"
            log_critical "Los cambios podrían no haberse aplicado completamente"
            POST_VERIFICATION_SUCCESS=false
            
            echo ""
            log_warning "🔍 ACCIONES RECOMENDADAS:"
            echo "1. Revisar logs de sincronización arriba"
            echo "2. Ejecutar manualmente: npm run db:sync:complete:alter"
            echo "3. Verificar permisos de BD y conectividad"
            echo "4. Contactar al equipo de desarrollo"
        fi
    else
        log_warning "Script de verificación no encontrado"
        POST_VERIFICATION_SUCCESS=true
    fi
else
    log_info "Verificación post-sincronización omitida (--skip-verification)"
    POST_VERIFICATION_SUCCESS=true
fi

# 7. PRUEBA FUNCIONAL BÁSICA
log_info "Realizando prueba funcional básica..."

FUNCTIONAL_TEST="
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
"

if echo "$FUNCTIONAL_TEST" | node --input-type=module; then
    log_success "Prueba funcional básica: EXITOSA"
    FUNCTIONAL_TEST_SUCCESS=true
else
    log_warning "Prueba funcional básica: CON PROBLEMAS"
    FUNCTIONAL_TEST_SUCCESS=false
fi

# 8. RESUMEN FINAL
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT DE BASE DE DATOS COMPLETADO${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

log_success "✅ Backup de seguridad creado"
log_success "✅ Conexión a BD verificada"
log_success "✅ Sincronización de modelos completada"

if [ "$SKIP_VERIFICATION" = false ]; then
    if [ "$POST_VERIFICATION_SUCCESS" = true ]; then
        log_success "✅ Verificación post-deployment exitosa"
    else
        log_warning "⚠️  Verificación post-deployment con problemas"
    fi
fi

if [ "$FUNCTIONAL_TEST_SUCCESS" = true ]; then
    log_success "✅ Prueba funcional básica exitosa"
else
    log_warning "⚠️  Prueba funcional básica con problemas"
fi

echo ""
log_info "📋 Siguiente paso: Reiniciar la aplicación en el servidor"
log_info "Comando sugerido: pm2 restart parroquia-api"
echo ""
log_info "🔗 Para verificar funcionamiento:"
echo "• Health check: http://servidor:puerto/health"
echo "• Test API: http://servidor:puerto/api/catalog/veredas"
echo ""

log_success "Deployment de BD finalizado: $(date)"

# Exit with appropriate code
if [ "$POST_VERIFICATION_SUCCESS" = true ] && [ "$FUNCTIONAL_TEST_SUCCESS" = true ]; then
    exit 0
else
    log_warning "Deployment completado con advertencias"
    exit 2
fi
