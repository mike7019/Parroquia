#!/bin/bash

# Script de despliegue de base de datos
# Ejecutar este script en el servidor después de hacer git pull

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de base de datos..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para log con colores
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

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "Error: No se encontró package.json. ¿Estás en el directorio correcto?"
    exit 1
fi

# Paso 1: Backup de base de datos
log_info "Creando backup de la base de datos..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

if command -v pg_dump >/dev/null 2>&1; then
    if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_USER" ] && [ ! -z "$DB_NAME" ]; then
        pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE
        log_success "Backup creado: $BACKUP_FILE"
    else
        log_warning "Variables de entorno de BD no configuradas, saltando backup automático"
        log_info "Ejecuta manualmente: pg_dump -h HOST -U USER -d DATABASE > backup.sql"
        read -p "¿Continuar sin backup? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Despliegue cancelado por el usuario"
            exit 1
        fi
    fi
else
    log_warning "pg_dump no encontrado, no se puede crear backup automático"
    read -p "¿Continuar sin backup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Despliegue cancelado por el usuario"
        exit 1
    fi
fi

# Paso 2: Instalar dependencias
log_info "Verificando dependencias..."
npm install --production
log_success "Dependencias actualizadas"

# Paso 3: Ejecutar limpieza de tablas duplicadas
log_info "Ejecutando limpieza de tablas duplicadas..."
if node clean-duplicate-tables.js; then
    log_success "Limpieza de tablas completada"
else
    log_warning "Limpieza de tablas tuvo algunos warnings (normal si las tablas ya están limpias)"
fi

# Paso 4: Ejecutar sincronización
log_info "Ejecutando sincronización de base de datos..."
if npm run db:sync:complete; then
    log_success "Sincronización de base de datos completada"
else
    log_error "Error en la sincronización de base de datos"
    exit 1
fi

# Paso 5: Verificar conexión
log_info "Verificando conexión a la base de datos..."
if node -e "
import sequelize from './config/sequelize.js';
await sequelize.authenticate();
console.log('✅ Conexión verificada');
await sequelize.close();
" 2>/dev/null; then
    log_success "Conexión a base de datos verificada"
else
    log_error "Error verificando conexión a base de datos"
    exit 1
fi

# Paso 6: Listar tablas finales
log_info "Listando tablas finales..."
node -e "
import sequelize from './config/sequelize.js';
const [results] = await sequelize.query(
  \"SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'\"
);
console.log(\`📊 Total de tablas: \${results[0].count}\`);
await sequelize.close();
" 2>/dev/null

echo
log_success "🎉 Despliegue de base de datos completado exitosamente!"
echo
log_info "Próximos pasos:"
echo "  1. Reiniciar el servidor de aplicación"
echo "  2. Verificar que la API funciona correctamente"
echo "  3. Probar endpoints críticos"

if [ -f "$BACKUP_FILE" ]; then
    echo
    log_info "📁 Backup guardado en: $BACKUP_FILE"
    echo "  - Puedes restaurar con: psql -h HOST -U USER -d DATABASE < $BACKUP_FILE"
fi
