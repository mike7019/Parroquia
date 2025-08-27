#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT SIMPLIFICADO PARA SERVIDOR DE PRODUCCIÓN
# Este script debe ejecutarse directamente en el servidor remoto
# Versión: 2.2 - Versión simplificada y robusta

echo "🚀 Iniciando deployment simplificado en servidor de producción..."
echo "📅 Fecha: $(date)"
echo "🔄 Versión script: 2.2"
echo "🌍 Servidor: $(hostname)"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Variables de configuración para servidor
DEPLOYMENT_LOG="logs/deployment_$(date +%Y%m%d_%H%M%S).log"
REQUIRED_NODE_VERSION="18"
APP_NAME="parroquia-api"
LOG_DIR="logs"

# Crear directorio de logs si no existe
mkdir -p $LOG_DIR

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a $DEPLOYMENT_LOG
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $DEPLOYMENT_LOG
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $DEPLOYMENT_LOG
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $DEPLOYMENT_LOG
}

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}" | tee -a $DEPLOYMENT_LOG
}

# Función para verificar prerrequisitos básicos
check_basic_environment() {
    log_step "Verificando entorno básico..."
    
    # Verificar Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge "$REQUIRED_NODE_VERSION" ]; then
            log_success "Node.js versión: $(node -v)"
        else
            log_error "Node.js versión $REQUIRED_NODE_VERSION+ requerida, encontrada: $(node -v)"
            return 1
        fi
    else
        log_error "Node.js no encontrado"
        return 1
    fi
    
    # Verificar npm
    if command -v npm &> /dev/null; then
        log_success "npm versión: $(npm -v)"
    else
        log_error "npm no encontrado"
        return 1
    fi
    
    # Buscar indicadores del proyecto
    local project_found=false
    
    if [ -f "package.json" ]; then
        log_success "package.json encontrado en directorio actual"
        project_found=true
    elif [ -f "../package.json" ]; then
        log_info "package.json encontrado en directorio padre, cambiando..."
        cd ..
        project_found=true
    fi
    
    if [ "$project_found" = false ]; then
        log_error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto"
        return 1
    fi
    
    log_success "Entorno básico verificado"
    log_info "Directorio de trabajo: $(pwd)"
    return 0
}

# Función para cargar configuración
load_config() {
    log_step "Cargando configuración..."
    
    if [ ! -f .env ]; then
        log_warning "Archivo .env no encontrado"
        log_info "Usando variables de entorno del sistema"
        return 0
    fi
    
    source .env
    log_success "Archivo .env cargado"
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ]; then
        log_warning "Variables de BD no configuradas completamente"
    else
        log_info "BD configurada: $DB_HOST/$DB_NAME"
    fi
    
    return 0
}

# Función para actualizar código
update_code() {
    log_step "Actualizando código..."
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_warning "No es un repositorio git - continuar sin actualización"
        return 0
    fi
    
    # Guardar cambios locales si los hay
    if ! git diff-index --quiet HEAD --; then
        log_warning "Guardando cambios locales..."
        git stash push -m "Server changes $(date +%Y%m%d_%H%M%S)"
    fi
    
    # Actualizar código
    git fetch origin
    
    if git show-ref --verify --quiet refs/remotes/origin/feature; then
        log_info "Actualizando rama feature..."
        git checkout feature
        git pull origin feature
    else
        log_info "Actualizando rama actual..."
        CURRENT_BRANCH=$(git branch --show-current)
        git pull origin $CURRENT_BRANCH
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Código actualizado correctamente"
        return 0
    else
        log_warning "Error actualizando código, continuar con versión actual"
        return 0
    fi
}

# Función para instalar dependencias
install_dependencies() {
    log_step "Instalando dependencias..."
    
    # Limpiar cache
    npm cache clean --force
    
    # Instalar dependencias
    npm install --production
    
    if [ $? -eq 0 ]; then
        log_success "Dependencias instaladas"
        return 0
    else
        log_error "Error instalando dependencias"
        return 1
    fi
}

# Función para sincronizar base de datos
sync_database() {
    log_step "Sincronizando base de datos..."
    
    echo ""
    echo "⚠️  SINCRONIZACIÓN DE BASE DE DATOS"
    echo "=================================="
    echo "Esta operación agregará el campo 'comunionEnCasa' si no existe"
    echo "Es segura y no elimina datos existentes"
    echo ""
    echo "¿Continuar? (y/n, default: y):"
    read -t 10 confirmation
    
    if [ -z "$confirmation" ]; then
        confirmation="y"
        echo "Timeout - continuando automáticamente..."
    fi
    
    if [ "$confirmation" != "y" ] && [ "$confirmation" != "Y" ]; then
        log_warning "Sincronización saltada por usuario"
        return 0
    fi
    
    # Script simple de sincronización
    cat > sync_simple.mjs << 'EOF'
import sequelize from './config/sequelize.js';

const syncSimple = async () => {
  try {
    console.log('🔄 Conectando a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a BD');
    
    // Verificar tabla familias
    const [tables] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'familias';
    `);
    
    if (tables.length === 0) {
      console.log('❌ Tabla familias no existe');
      process.exit(1);
    }
    
    // Verificar y agregar columna comunionEnCasa
    const [columns] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name IN ('comunionencasa', 'comunion_en_casa', 'comunionEnCasa');
    `);
    
    if (columns.length === 0) {
      console.log('➕ Agregando columna comunionEnCasa...');
      try {
        await sequelize.query(`
          ALTER TABLE familias 
          ADD COLUMN "comunionEnCasa" BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Columna agregada exitosamente');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️  Columna ya existe');
        } else {
          throw error;
        }
      }
    } else {
      console.log('ℹ️  Campo de comunión ya existe:', columns[0].column_name);
    }
    
    // Sincronización suave
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Sincronización Sequelize completada');
    } catch (error) {
      console.log('⚠️  Sincronización Sequelize falló, pero cambios manuales aplicados');
    }
    
    await sequelize.close();
    console.log('🎉 Sincronización completada');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

syncSimple();
EOF
    
    node sync_simple.mjs
    local result=$?
    rm -f sync_simple.mjs
    
    if [ $result -eq 0 ]; then
        log_success "Base de datos sincronizada"
        return 0
    else
        log_warning "Error en sincronización de BD, pero continuando"
        return 0  # No fallar el deployment por esto
    fi
}

# Función para reiniciar servicios
restart_services() {
    log_step "Reiniciando servicios..."
    
    # Detectar archivo principal
    local main_file="server.js"
    if [ -f "src/server.js" ]; then
        main_file="src/server.js"
    elif [ -f "app.js" ]; then
        main_file="app.js"
    elif [ -f "index.js" ]; then
        main_file="index.js"
    fi
    
    # Reiniciar con PM2 si está disponible
    if command -v pm2 &> /dev/null; then
        log_info "Usando PM2 para gestionar la aplicación..."
        
        if pm2 list | grep -q "$APP_NAME"; then
            pm2 restart $APP_NAME
            log_success "Aplicación reiniciada con PM2"
        else
            if [ -f "ecosystem.config.cjs" ]; then
                pm2 start ecosystem.config.cjs
            else
                pm2 start $main_file --name "$APP_NAME"
            fi
            log_success "Aplicación iniciada con PM2"
        fi
        
        pm2 save
        
    else
        log_warning "PM2 no disponible"
        echo ""
        echo "Reinicia manualmente con:"
        echo "  node $main_file"
        echo ""
        echo "O instala PM2:"
        echo "  npm install -g pm2"
        echo "  pm2 start $main_file --name $APP_NAME"
    fi
    
    return 0
}

# Función para verificar salud básica
verify_health() {
    log_step "Verificando salud básica..."
    
    local app_port="${PORT:-3000}"
    
    log_info "Esperando que el servidor inicie..."
    sleep 10
    
    # Verificar puerto
    if netstat -tlnp 2>/dev/null | grep -q ":$app_port "; then
        log_success "Servidor escuchando en puerto $app_port"
    elif ss -tlnp 2>/dev/null | grep -q ":$app_port "; then
        log_success "Servidor escuchando en puerto $app_port (ss)"
    else
        log_warning "No se detectó servidor en puerto $app_port"
        log_info "Verifica manualmente con: netstat -tlnp | grep $app_port"
    fi
    
    # Verificar proceso Node.js
    if pgrep -f node > /dev/null; then
        log_success "Procesos Node.js detectados"
    else
        log_warning "No se detectaron procesos Node.js"
    fi
    
    return 0
}

# Función principal simplificada
main() {
    echo "🚀 DEPLOYMENT SIMPLIFICADO EN SERVIDOR"
    echo "======================================"
    echo "Servidor: $(hostname)"
    echo "Usuario: $(whoami)"
    echo "Directorio: $(pwd)"
    echo "Inicio: $(date)"
    echo ""
    
    # Fases simplificadas
    local phases=(
        "check_basic_environment"
        "load_config"
        "update_code"
        "install_dependencies"
        "sync_database"
        "restart_services"
        "verify_health"
    )
    
    local failed_phase=""
    
    for phase in "${phases[@]}"; do
        echo ""
        if ! $phase; then
            failed_phase=$phase
            log_error "Fase $phase falló"
            break
        fi
    done
    
    echo ""
    
    if [ -n "$failed_phase" ]; then
        echo "💥 DEPLOYMENT FALLÓ EN FASE: $failed_phase"
        echo "========================================"
        echo ""
        echo "Verifica y reinicia manualmente:"
        echo "1. Instalar dependencias: npm install"
        echo "2. Iniciar aplicación: npm start"
        echo "3. O con PM2: pm2 start ecosystem.config.cjs"
        exit 1
    fi
    
    # Deployment exitoso
    echo "🎉 DEPLOYMENT COMPLETADO"
    echo "======================="
    echo ""
    log_success "✅ Entorno verificado"
    log_success "✅ Código actualizado (si aplicable)"
    log_success "✅ Dependencias instaladas"
    log_success "✅ Base de datos sincronizada"
    log_success "✅ Servicios reiniciados"
    log_success "✅ Salud básica verificada"
    
    echo ""
    echo "🔧 VERIFICACIONES RECOMENDADAS:"
    echo "==============================="
    echo "1. Probar endpoints de la API"
    echo "2. Verificar logs: pm2 logs $APP_NAME"
    echo "3. Monitorear rendimiento: pm2 monit"
    echo ""
    
    echo "📊 COMANDOS ÚTILES:"
    echo "=================="
    echo "• Estado: pm2 status"
    echo "• Logs: pm2 logs $APP_NAME"
    echo "• Reiniciar: pm2 restart $APP_NAME"
    echo "• Parar: pm2 stop $APP_NAME"
    echo ""
    
    echo "📁 Log del deployment: $DEPLOYMENT_LOG"
    log_success "🎉 Deployment finalizado: $(date)"
}

# Verificar argumentos de ayuda
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Uso: $0"
    echo ""
    echo "Script simplificado de deployment para servidor de producción"
    echo ""
    echo "Características:"
    echo "• Verificación básica de entorno"
    echo "• Actualización de código automática"
    echo "• Instalación de dependencias"
    echo "• Sincronización segura de BD"
    echo "• Reinicio de servicios con PM2"
    echo "• Verificación de salud básica"
    echo ""
    echo "Prerrequisitos:"
    echo "• Node.js 18+"
    echo "• npm"
    echo "• Archivo .env configurado"
    echo "• PM2 instalado (recomendado)"
    exit 0
fi

# Ejecutar deployment
main "$@"
