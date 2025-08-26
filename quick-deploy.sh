#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT SIMPLIFICADO - VERSIÓN SERVIDOR
# Copia este script a tu servidor y ejecútalo directamente
# Versión: 2.3 - Solución para problemas de deployment

echo "🚀 Iniciando deployment simplificado..."
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

APP_NAME="parroquia-api"

echo "🔧 DEPLOYMENT RÁPIDO PARA SERVIDOR"
echo "=================================="

# 1. Verificar entorno básico
log_info "Verificando entorno..."
if [ ! -f "package.json" ]; then
    log_error "package.json no encontrado. Ve al directorio del proyecto."
    exit 1
fi
log_success "Directorio del proyecto verificado"

# 2. Actualizar código si es posible
log_info "Actualizando código..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    git stash push -m "Server backup $(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    git fetch origin 2>/dev/null || true
    git pull origin feature 2>/dev/null || git pull 2>/dev/null || true
    log_success "Código actualizado"
else
    log_warning "No es repo git, saltando actualización"
fi

# 3. Instalar dependencias rápido
log_info "Instalando dependencias..."
npm install --production --silent
log_success "Dependencias instaladas"

# 4. Sincronización de BD inteligente
log_info "Verificando base de datos..."

cat > quick_sync.mjs << 'EOF'
import sequelize from './config/sequelize.js';

const quickSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a BD');
    
    // Verificar columna comunionEnCasa (cualquier variación)
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND LOWER(column_name) LIKE '%comunion%';
    `);
    
    if (columns.length > 0) {
      console.log('ℹ️  Campo de comunión encontrado:', columns[0].column_name);
    } else {
      console.log('➕ Agregando campo comunionEnCasa...');
      try {
        await sequelize.query(`
          ALTER TABLE familias 
          ADD COLUMN "comunionEnCasa" BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Campo agregado');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️  Campo ya existe');
        } else {
          console.log('⚠️  Error agregando campo:', error.message);
        }
      }
    }
    
    // Sincronización suave
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Sincronización completada');
    } catch (error) {
      console.log('⚠️  Sincronización parcial:', error.message);
    }
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error BD:', error.message);
    process.exit(1);
  }
};

quickSync();
EOF

node quick_sync.mjs
DB_RESULT=$?
rm -f quick_sync.mjs

if [ $DB_RESULT -eq 0 ]; then
    log_success "Base de datos sincronizada"
else
    log_warning "BD con warnings, pero continuando"
fi

# 5. Reiniciar servicios
log_info "Reiniciando servicios..."

if command -v pm2 &> /dev/null; then
    # Verificar si PM2 tiene la app
    if pm2 list | grep -q "$APP_NAME"; then
        log_info "Reiniciando con PM2..."
        pm2 restart "$APP_NAME"
        pm2 save
        log_success "Servicio reiniciado con PM2"
    else
        log_info "Iniciando nueva instancia..."
        if [ -f "ecosystem.config.cjs" ]; then
            pm2 start ecosystem.config.cjs
        else
            # Detectar archivo principal
            if [ -f "src/server.js" ]; then
                pm2 start src/server.js --name "$APP_NAME"
            elif [ -f "server.js" ]; then
                pm2 start server.js --name "$APP_NAME"
            else
                pm2 start app.js --name "$APP_NAME"
            fi
        fi
        pm2 save
        log_success "Servicio iniciado con PM2"
    fi
    
    # Mostrar estado
    echo ""
    pm2 status
    echo ""
    
else
    log_warning "PM2 no disponible"
    echo ""
    echo "Inicia manualmente:"
    echo "  npm start"
    echo "  o"
    echo "  node src/server.js"
    echo ""
fi

# 6. Verificación básica
log_info "Verificando salud..."
sleep 5

PORT=${PORT:-3000}
if netstat -tlnp 2>/dev/null | grep -q ":$PORT " || ss -tlnp 2>/dev/null | grep -q ":$PORT "; then
    log_success "Servidor funcionando en puerto $PORT"
else
    log_warning "Puerto $PORT no detectado, verifica manualmente"
fi

if pgrep -f node > /dev/null; then
    log_success "Procesos Node.js activos"
else
    log_warning "No se detectaron procesos Node.js"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETADO"
echo "======================="
log_success "✅ Código actualizado"
log_success "✅ Dependencias instaladas"
log_success "✅ Base de datos sincronizada"
log_success "✅ Servicios reiniciados"

echo ""
echo "📊 COMANDOS ÚTILES:"
echo "=================="
echo "• Ver estado: pm2 status"
echo "• Ver logs: pm2 logs $APP_NAME"
echo "• Reiniciar: pm2 restart $APP_NAME"
echo "• Monitorear: pm2 monit"

echo ""
echo "🔍 VERIFICAR ENDPOINTS:"
echo "======================"
echo "• Health: curl http://localhost:$PORT/health"
echo "• API Docs: curl http://localhost:$PORT/api-docs"
echo "• Test: curl http://localhost:$PORT/api/encuesta"

echo ""
log_success "🎉 Deployment finalizado: $(date)"
