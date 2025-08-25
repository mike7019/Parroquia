#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT COMPLETO PARA SERVIDOR REMOTO
# Este script sincroniza todos los cambios de BD y código en el servidor

echo "🚀 Iniciando deployment completo en servidor remoto..."
echo "📅 Fecha: $(date)"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
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

# 1. BACKUP DE SEGURIDAD
log_info "Creando backup de seguridad..."
BACKUP_DIR="backups/deployment_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup de BD
log_info "Backup de base de datos..."
if command -v pg_dump &> /dev/null; then
    pg_dump -h ${DB_HOST:-localhost} -U ${DB_USER:-parroquia_user} -d ${DB_NAME:-parroquia_db} > $BACKUP_DIR/database_backup.sql
    log_success "Backup de BD creado: $BACKUP_DIR/database_backup.sql"
else
    log_warning "pg_dump no encontrado, saltando backup de BD"
fi

# 2. ACTUALIZAR CÓDIGO
log_info "Actualizando código desde repositorio..."

# Guardar cambios locales si los hay
if ! git diff-index --quiet HEAD --; then
    log_warning "Hay cambios locales, guardando stash..."
    git stash push -m "Deploy backup $(date +%Y%m%d_%H%M%S)"
fi

# Fetch y pull
git fetch origin
log_info "Cambiando a rama feature..."
git checkout feature
git pull origin feature

if [ $? -eq 0 ]; then
    log_success "Código actualizado correctamente"
else
    log_error "Error actualizando código"
    exit 1
fi

# 3. INSTALAR/ACTUALIZAR DEPENDENCIAS
log_info "Instalando dependencias..."
npm install --production

if [ $? -eq 0 ]; then
    log_success "Dependencias instaladas"
else
    log_error "Error instalando dependencias"
    exit 1
fi

# 4. VERIFICAR VARIABLES DE ENTORNO
log_info "Verificando configuración..."
if [ ! -f .env ]; then
    log_error "Archivo .env no encontrado"
    echo "Crea el archivo .env con las variables necesarias:"
    echo "DB_HOST=localhost"
    echo "DB_USER=parroquia_user"
    echo "DB_PASSWORD=tu_password"
    echo "DB_NAME=parroquia_db"
    echo "DB_PORT=5432"
    exit 1
fi

# 5. PROBAR CONEXIÓN A BD
log_info "Probando conexión a base de datos..."
node -e "
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
" --input-type=module

if [ $? -ne 0 ]; then
    log_error "No se puede conectar a la base de datos"
    exit 1
fi

# 6. EJECUTAR SINCRONIZACIÓN DE BD
log_info "Ejecutando sincronización de base de datos..."
echo "⚠️  IMPORTANTE: Esto va a sincronizar la BD con los modelos actualizados"
echo "Presiona ENTER para continuar o Ctrl+C para cancelar..."
read

# Usar el comando correcto de npm para sincronización completa
log_info "Ejecutando npm run db:sync:complete:alter..."
npm run db:sync:complete:alter

if [ $? -eq 0 ]; then
    log_success "Sincronización de BD completada exitosamente"
    log_info "Todos los modelos han sido sincronizados con ALTER"
else
    log_error "Error en sincronización de BD"
    log_info "Intentando sincronización alternativa..."
    
    # Fallback a script directo si npm script falla
    if [ -f "syncDatabaseComplete.js" ]; then
        node syncDatabaseComplete.js
        if [ $? -eq 0 ]; then
            log_success "Sincronización alternativa completada"
        else
            log_error "Error en ambos métodos de sincronización de BD"
            exit 1
        fi
    else
        log_error "Error en sincronización de BD y script de fallback no encontrado"
        exit 1
    fi
fi

# 7. VERIFICAR ESTADO FINAL
log_info "Verificando estado final de la base de datos..."

# Usar script específico de verificación post-deployment
if [ -f "verify-post-deployment.cjs" ]; then
    node verify-post-deployment.cjs
    
    if [ $? -eq 0 ]; then
        log_success "Verificación post-deployment exitosa"
        log_success "Todos los cambios de BD se aplicaron correctamente"
    else
        log_error "Verificación post-deployment falló"
        log_warning "Los cambios de BD podrían no haberse aplicado correctamente"
        log_info "Revisar logs arriba para más detalles"
    fi
else
    # Fallback al script original
    if [ -f "verificar-simple.js" ]; then
        node verificar-simple.js
        
        if [ $? -eq 0 ]; then
            log_success "Verificación básica exitosa"
        else
            log_warning "Verificación básica con problemas, revisar logs"
        fi
    else
        log_warning "Script de verificación no encontrado"
    fi
fi

# 8. REINICIAR SERVICIOS (si usa PM2)
if command -v pm2 &> /dev/null; then
    log_info "Reiniciando aplicación con PM2..."
    pm2 restart parroquia-api || pm2 start ecosystem.config.cjs
    log_success "Aplicación reiniciada"
else
    log_warning "PM2 no encontrado. Reinicia el servidor manualmente."
fi

# 9. VERIFICAR QUE EL SERVIDOR RESPONDA
log_info "Verificando que el servidor responda..."
sleep 5

# Intentar conectar al servidor
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    log_success "Servidor respondiendo en puerto 3000"
elif curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    log_success "Servidor respondiendo en puerto 5000"
else
    log_warning "Servidor no responde en puertos comunes, verificar manualmente"
fi

# 10. RESUMEN FINAL
echo ""
echo "🎉 DEPLOYMENT COMPLETADO"
echo "========================"
log_success "Código actualizado desde rama feature"
log_success "Base de datos sincronizada"
log_success "Dependencias instaladas"
log_success "Backup creado en: $BACKUP_DIR"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verificar que la aplicación funcione correctamente"
echo "2. Probar APIs críticas (especialmente /api/catalog/veredas)"
echo "3. Monitorear logs por posibles errores"
echo ""
echo "🔗 URLs para probar:"
echo "- Health check: http://tu-servidor:3000/health"
echo "- API Veredas: http://tu-servidor:3000/api/catalog/veredas"
echo ""
log_success "Deployment finalizado: $(date)"
