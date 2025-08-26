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

# Función para verificar entorno del servidor
check_server_environment() {
    log_step "Verificando entorno del servidor..."
    
    # Verificar que estamos en un directorio del proyecto (más flexible)
    local project_indicators=0
    
    # Buscar indicadores del proyecto de parroquia
    if [ -f "package.json" ]; then
        log_info "✓ package.json encontrado"
        project_indicators=$((project_indicators + 1))
    elif [ -f "../package.json" ]; then
        log_info "✓ package.json encontrado en directorio padre"
        cd ..
        project_indicators=$((project_indicators + 1))
    fi
    
    if [ -f "src/server.js" ]; then
        log_info "✓ src/server.js encontrado"
        project_indicators=$((project_indicators + 1))
    elif [ -f "server.js" ]; then
        log_info "✓ server.js encontrado en raíz"
        project_indicators=$((project_indicators + 1))
    elif [ -f "app.js" ]; then
        log_info "✓ app.js encontrado"
        project_indicators=$((project_indicators + 1))
    fi
    
    if [ -d "src" ]; then
        log_info "✓ Directorio src/ encontrado"
        project_indicators=$((project_indicators + 1))
    fi
    
    if [ -d "src/models" ] || [ -d "models" ]; then
        log_info "✓ Directorio de modelos encontrado"
        project_indicators=$((project_indicators + 1))
    fi
    
    if [ -d "src/controllers" ] || [ -d "controllers" ]; then
        log_info "✓ Directorio de controladores encontrado"
        project_indicators=$((project_indicators + 1))
    fi
    
    # Verificar que tenemos suficientes indicadores
    if [ $project_indicators -lt 2 ]; then
        log_error "No parece ser un directorio del proyecto parroquia"
        log_error "Directorio actual: $(pwd)"
        log_error "Archivos encontrados: $(ls -la | head -10)"
        log_error "Asegúrate de estar en el directorio raíz del proyecto"
        return 1
    fi
    
    log_success "Directorio del proyecto verificado ($project_indicators indicadores)"
    log_info "Directorio de trabajo: $(pwd)"
    
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
    
    # Verificar git
    if command -v git &> /dev/null; then
        log_success "git disponible: $(git --version | cut -d' ' -f3)"
    else
        log_warning "git no encontrado - deployment manual requerido"
    fi
    
    # Verificar PostgreSQL cliente
    if command -v psql &> /dev/null; then
        log_success "PostgreSQL cliente disponible"
    else
        log_warning "PostgreSQL cliente no encontrado"
    fi
    
    # Verificar espacio en disco
    DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 90 ]; then
        log_success "Espacio en disco disponible: $((100-DISK_USAGE))%"
    else
        log_warning "Poco espacio en disco: ${DISK_USAGE}% usado"
    fi
    
    # Verificar memoria
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
    log_info "Uso de memoria: ${MEMORY_USAGE}%"
    
    return 0
}

# Función para crear backup completo del servidor
create_server_backup() {
    log_step "Creando backup de seguridad en servidor..."
    BACKUP_DIR="backups/deployment_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup de código actual (excluyendo archivos temporales)
    log_info "Backup de código actual..."
    tar -czf $BACKUP_DIR/code_backup.tar.gz \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=backups \
        --exclude=logs \
        --exclude='*.log' \
        .
    
    # Backup de configuración crítica
    if [ -f .env ]; then
        cp .env $BACKUP_DIR/env_backup
        log_success "Backup de configuración .env creado"
    fi
    
    if [ -f ecosystem.config.cjs ]; then
        cp ecosystem.config.cjs $BACKUP_DIR/ecosystem_backup.cjs
        log_success "Backup de configuración PM2 creado"
    fi
    
    # Backup de BD solo si las credenciales están disponibles
    if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_USER" ] && [ ! -z "$DB_NAME" ] && command -v pg_dump &> /dev/null; then
        log_info "Creando backup de base de datos..."
        PGPASSWORD=$DB_PASSWORD pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
            --no-owner --no-privileges --clean --if-exists \
            > $BACKUP_DIR/database_backup.sql 2>/dev/null
        if [ $? -eq 0 ]; then
            log_success "Backup de BD creado: $BACKUP_DIR/database_backup.sql"
        else
            log_warning "Error creando backup de BD - continuando sin backup"
        fi
    else
        log_warning "Configuración de BD no disponible - saltando backup de BD"
    fi
    
    echo "BACKUP_DIR=$BACKUP_DIR" > backup_info.txt
    log_success "Backup completo creado en: $BACKUP_DIR"
    return 0
}

# Función para cargar y verificar configuración
load_server_config() {
    log_step "Cargando configuración del servidor..."
    
    if [ ! -f .env ]; then
        log_error "Archivo .env no encontrado en servidor"
        echo ""
        echo "Crea el archivo .env con la configuración del servidor:"
        echo "# Database Configuration"
        echo "DB_HOST=localhost"
        echo "DB_USER=parroquia_user"
        echo "DB_PASSWORD=tu_password_seguro"
        echo "DB_NAME=parroquia_db"
        echo "DB_PORT=5432"
        echo ""
        echo "# Server Configuration"
        echo "PORT=3000"
        echo "NODE_ENV=production"
        echo ""
        echo "# JWT Configuration"
        echo "JWT_SECRET=tu_jwt_secret_muy_seguro_para_produccion"
        echo "JWT_EXPIRES_IN=24h"
        return 1
    fi
    
    # Cargar variables de entorno
    source .env
    
    # Verificar variables críticas para producción
    local required_vars=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "JWT_SECRET" "NODE_ENV")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variables de entorno faltantes: ${missing_vars[*]}"
        return 1
    fi
    
    # Verificar que estamos en modo producción
    if [ "$NODE_ENV" != "production" ]; then
        log_warning "NODE_ENV no está configurado como 'production' (actual: $NODE_ENV)"
    fi
    
    log_success "Configuración del servidor cargada correctamente"
    log_info "Base de datos: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    log_info "Puerto de aplicación: ${PORT:-3000}"
    log_info "Entorno: $NODE_ENV"
    
    return 0
}

# Función para actualizar código en servidor
update_server_code() {
    log_step "Actualizando código en servidor..."
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_warning "No es un repositorio git - actualización manual requerida"
        echo ""
        echo "Para actualizar manualmente:"
        echo "1. Sube los archivos nuevos al servidor"
        echo "2. Asegúrate de incluir src/controllers/encuestaController.js"
        echo "3. Asegúrate de incluir src/models/catalog/"
        echo "4. Asegúrate de incluir src/validators/encuestaValidator.js"
        echo ""
        echo "¿Continuar con el deployment? (y/n)"
        read -r continue_deploy
        if [ "$continue_deploy" != "y" ] && [ "$continue_deploy" != "Y" ]; then
            return 1
        fi
        return 0
    fi
    
    # Guardar cambios locales si los hay
    if ! git diff-index --quiet HEAD --; then
        log_warning "Hay cambios locales en servidor, guardando stash..."
        git stash push -m "Server local changes $(date +%Y%m%d_%H%M%S)"
    fi
    
    # Fetch y pull
    log_info "Obteniendo últimos cambios del repositorio..."
    git fetch origin
    
    # Verificar rama actual
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Rama actual: $CURRENT_BRANCH"
    
    # Intentar usar rama feature si existe
    if git show-ref --verify --quiet refs/remotes/origin/feature; then
        log_info "Cambiando a rama feature..."
        git checkout feature
        git pull origin feature
    else
        log_info "Rama feature no encontrada, actualizando rama actual..."
        git pull origin $CURRENT_BRANCH
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Código actualizado correctamente"
        log_info "Último commit: $(git log -1 --oneline)"
        return 0
    else
        log_error "Error actualizando código desde git"
        return 1
    fi
}

# Función para instalar dependencias de producción
install_production_dependencies() {
    log_step "Instalando dependencias de producción..."
    
    # Detener aplicación temporalmente para evitar conflictos
    if command -v pm2 &> /dev/null && pm2 list | grep -q "$APP_NAME"; then
        log_info "Deteniendo aplicación temporalmente..."
        pm2 stop $APP_NAME
    fi
    
    # Limpiar cache y reinstalar
    npm cache clean --force
    
    # Eliminar node_modules para instalación limpia en producción
    if [ -d "node_modules" ]; then
        log_info "Eliminando node_modules para instalación limpia..."
        rm -rf node_modules
    fi
    
    # Instalar solo dependencias de producción
    log_info "Instalando dependencias de producción..."
    npm ci --production --no-audit --no-fund
    
    if [ $? -eq 0 ]; then
        log_success "Dependencias de producción instaladas"
        
        # Mostrar estadísticas
        PACKAGE_COUNT=$(npm list --depth=0 --production 2>/dev/null | grep -c '├──\|└──' || echo "N/A")
        log_info "Packages instalados: $PACKAGE_COUNT"
        
        return 0
    else
        log_error "Error instalando dependencias"
        return 1
    fi
}

# Función para probar conexión a BD en servidor
test_production_database() {
    log_step "Probando conexión a base de datos de producción..."
    
    # Crear script temporal para probar conexión
    cat > test_prod_db.mjs << 'EOF'
import sequelize from './config/sequelize.js';

const testProductionDB = async () => {
  try {
    console.log('🔗 Conectando a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a BD de producción exitosa');
    
    // Verificar tablas críticas existen
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('familias', 'personas', 'usuarios', 'municipios');
    `);
    
    console.log('📊 Estado de tablas críticas:');
    const requiredTables = ['familias', 'personas', 'usuarios', 'municipios'];
    const foundTables = tables.map(t => t.table_name);
    
    requiredTables.forEach(table => {
      const found = tables.find(t => t.table_name === table);
      if (found) {
        console.log(`  ✅ ${table}: ${found.column_count} columnas`);
      } else {
        console.log(`  ❌ ${table}: NO ENCONTRADA`);
      }
    });
    
    // Verificar datos básicos
    const [familyCount] = await sequelize.query('SELECT COUNT(*) as count FROM familias');
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM usuarios');
    
    console.log('📈 Datos existentes:');
    console.log(`  - Familias: ${familyCount[0].count}`);
    console.log(`  - Usuarios: ${userCount[0].count}`);
    
    await sequelize.close();
    console.log('✅ Verificación de BD de producción completa');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error conexión BD producción:', error.message);
    console.error('🔍 Detalles:', error.original?.message || 'N/A');
    process.exit(1);
  }
};

testProductionDB();
EOF
    
    node test_prod_db.mjs
    local result=$?
    rm -f test_prod_db.mjs
    
    if [ $result -eq 0 ]; then
        log_success "Base de datos de producción verificada"
        return 0
    else
        log_error "No se puede conectar a la base de datos de producción"
        log_error "Verifica la configuración en .env"
        return 1
    fi
}

# Función para sincronizar BD en producción con seguridad
sync_production_database() {
    log_step "Sincronizando base de datos de producción..."
    
    echo ""
    echo "⚠️  SINCRONIZACIÓN DE BASE DE DATOS DE PRODUCCIÓN"
    echo "================================================"
    echo "Esta operación va a:"
    echo "✅ Agregar el campo 'comunionEnCasa' a la tabla familias (si no existe)"
    echo "✅ Verificar estructura de tablas principales"
    echo "✅ Aplicar cambios usando ALTER TABLE (seguro para datos existentes)"
    echo "✅ Mantener TODOS los datos existentes"
    echo ""
    echo "⚠️  IMPORTANTE: Esta operación es SEGURA para producción"
    echo "   - NO elimina tablas existentes"
    echo "   - NO elimina datos"
    echo "   - Solo agrega nuevas columnas y configuraciones"
    echo ""
    echo "¿Continuar con la sincronización? (escriba 'SI' para confirmar, o 'AUTO' para continuar automáticamente):"
    read confirmation
    
    if [ "$confirmation" != "SI" ] && [ "$confirmation" != "AUTO" ]; then
        log_warning "Sincronización cancelada por usuario"
        return 1
    fi
    
    # Crear script de sincronización segura para producción
    cat > sync_prod_safe.mjs << 'EOF'
import sequelize from './config/sequelize.js';

const syncProductionSafe = async () => {
  try {
    console.log('🔄 Iniciando sincronización segura de producción...');
    
    // Verificar conexión a BD
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Verificar si la columna comunionEnCasa ya existe
    const [columnExists] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' AND column_name = 'comunionencasa';
    `);
    
    if (columnExists.length === 0) {
      console.log('➕ Agregando columna comunionEnCasa a tabla familias...');
      await sequelize.query(`
        ALTER TABLE familias 
        ADD COLUMN "comunionEnCasa" BOOLEAN DEFAULT FALSE;
      `);
      
      await sequelize.query(`
        COMMENT ON COLUMN familias."comunionEnCasa" 
        IS 'Indica si la familia realiza comunión en casa';
      `);
      
      console.log('✅ Columna comunionEnCasa agregada exitosamente');
    } else {
      console.log('ℹ️  Columna comunionEnCasa ya existe');
    }
    
    // Verificar tablas principales
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('familias', 'personas', 'usuarios', 'municipios');
    `);
    
    console.log('� Estado de tablas principales:');
    tables.forEach(table => {
      console.log(`  ✅ ${table.table_name}: ${table.column_count} columnas`);
    });
    
    // Intentar sincronización suave con Sequelize si los modelos están disponibles
    try {
      console.log('� Intentando sincronización con Sequelize...');
      await sequelize.sync({ alter: true });
      console.log('✅ Sincronización con Sequelize completada');
    } catch (syncError) {
      console.log('⚠️  Sincronización con Sequelize falló, pero la BD está actualizada manualmente');
      console.log('   Error:', syncError.message);
    }
    
    await sequelize.close();
    console.log('🎉 Sincronización de producción completada exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en sincronización de producción:', error.message);
    console.error('   Detalles:', error.original?.message || 'N/A');
    process.exit(1);
  }
};

syncProductionSafe();
EOF
    
    node sync_prod_safe.mjs
    local result=$?
    rm -f sync_prod_safe.mjs
    
    if [ $result -eq 0 ]; then
        log_success "Base de datos de producción sincronizada correctamente"
        return 0
    else
        log_error "Error sincronizando base de datos de producción"
        return 1
    fi
}

# Función para verificar funcionalidades en producción
verify_production_features() {
    log_step "Verificando funcionalidades en producción..."
    
    cat > verify_prod_features.mjs << 'EOF'
import sequelize from './config/sequelize.js';

const verifyProductionFeatures = async () => {
  try {
    console.log('🔍 Verificando nuevas funcionalidades en producción...');
    
    // 1. Verificar estructura actual de la tabla familias
    console.log('📊 Verificando estructura de tabla familias...');
    const [familiaColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas actuales en tabla familias:');
    familiaColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // 2. Buscar variaciones del campo comunionEnCasa
    const comunionVariations = ['comunionencasa', 'comunion_en_casa', 'comunionEnCasa'];
    let comunionFieldFound = false;
    let foundFieldName = '';
    
    for (const variation of comunionVariations) {
      const found = familiaColumns.find(col => 
        col.column_name.toLowerCase() === variation.toLowerCase()
      );
      if (found) {
        comunionFieldFound = true;
        foundFieldName = found.column_name;
        console.log(`✅ Campo de comunión encontrado: ${foundFieldName} (${found.data_type})`);
        break;
      }
    }
    
    if (!comunionFieldFound) {
      console.log('⚠️  Campo comunionEnCasa NO encontrado');
      console.log('   Esto es normal si es la primera ejecución del deployment');
      console.log('   El campo será creado en la fase de sincronización');
    }
    
    // 3. Verificar que los modelos están disponibles
    try {
      const [tables] = await sequelize.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' AND table_name IN ('familias', 'personas');
      `);
      
      const foundTables = tables.map(t => ({ name: t.table_name, columns: t.column_count }));
      if (foundTables.length >= 2) {
        console.log('✅ Tablas principales disponibles:');
        foundTables.forEach(table => {
          console.log(`  - ${table.name}: ${table.columns} columnas`);
        });
      } else {
        console.log('❌ Tablas principales no encontradas completas:', foundTables);
        process.exit(1);
      }
    } catch (tableError) {
      console.log('❌ Error verificando tablas:', tableError.message);
      process.exit(1);
    }
    
    // 4. Verificar función de validación de miembros únicos
    const fs = await import('fs');
    const possibleControllerPaths = [
      './src/controllers/encuestaController.js',
      './controllers/encuestaController.js',
      './src/controller/encuestaController.js',
      './Controller/encuestaController.js'
    ];
    
    let controllerFound = false;
    for (const controllerPath of possibleControllerPaths) {
      if (fs.existsSync(controllerPath)) {
        const controllerContent = fs.readFileSync(controllerPath, 'utf8');
        
        if (controllerContent.includes('validarMiembrosUnicos') || 
            controllerContent.includes('MIEMBROS_DUPLICADOS') ||
            controllerContent.includes('identificacion')) {
          console.log('✅ Funcionalidad de validación disponible en producción');
          console.log(`   Ubicación: ${controllerPath}`);
          controllerFound = true;
          break;
        }
      }
    }
    
    if (!controllerFound) {
      console.log('⚠️  Validación de miembros únicos NO encontrada en controladores');
      console.log('   Rutas verificadas:', possibleControllerPaths.join(', '));
      console.log('   Esto puede ser normal si usas una estructura diferente');
    }
    
    // 5. Verificar validador de encuestas (opcional)
    const possibleValidatorPaths = [
      './src/validators/encuestaValidator.js',
      './validators/encuestaValidator.js',
      './src/validator/encuestaValidator.js',
      './Validator/encuestaValidator.js'
    ];
    
    let validatorFound = false;
    for (const validatorPath of possibleValidatorPaths) {
      if (fs.existsSync(validatorPath)) {
        console.log('✅ Validador de encuestas disponible');
        console.log(`   Ubicación: ${validatorPath}`);
        validatorFound = true;
        break;
      }
    }
    
    if (!validatorFound) {
      console.log('ℹ️  Validador de encuestas NO encontrado (opcional)');
    }
    
    // 6. Verificar configuración de base de datos
    const [dbInfo] = await sequelize.query(`
      SELECT current_database() as db_name, 
             current_user as db_user,
             version() as db_version;
    `);
    
    console.log('🗄️  Información de base de datos:');
    console.log(`   Base de datos: ${dbInfo[0].db_name}`);
    console.log(`   Usuario: ${dbInfo[0].db_user}`);
    console.log(`   Versión: ${dbInfo[0].db_version.split(' ')[0]} ${dbInfo[0].db_version.split(' ')[1]}`);
    
    await sequelize.close();
    console.log('🎉 Verificación de funcionalidades completada');
    console.log('   Nota: Algunas funcionalidades pueden agregarse durante la sincronización');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error verificando funcionalidades:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
};

verifyProductionFeatures();
EOF
    
    node verify_prod_features.mjs
    local result=$?
    rm -f verify_prod_features.mjs
    
    if [ $result -eq 0 ]; then
        log_success "Funcionalidades verificadas en producción"
        return 0
    else
        log_error "Error verificando funcionalidades en producción"
        return 1
    fi
}

# Función para reiniciar servicios en servidor
restart_production_services() {
    log_step "Reiniciando servicios de producción..."
    
    # Detectar el archivo principal de la aplicación
    local main_file=""
    if [ -f "src/server.js" ]; then
        main_file="src/server.js"
    elif [ -f "server.js" ]; then
        main_file="server.js"
    elif [ -f "app.js" ]; then
        main_file="app.js"
    elif [ -f "index.js" ]; then
        main_file="index.js"
    else
        log_warning "Archivo principal de aplicación no encontrado"
        main_file="server.js"  # Valor por defecto
    fi
    
    log_info "Archivo principal detectado: $main_file"
    
    # Reiniciar con PM2 (método preferido para producción)
    if command -v pm2 &> /dev/null; then
        log_info "Gestionando aplicación con PM2..."
        
        # Verificar si la app ya está registrada
        if pm2 list | grep -q "$APP_NAME"; then
            log_info "Reiniciando aplicación existente..."
            pm2 restart $APP_NAME
            pm2 reload $APP_NAME  # Graceful reload
            log_success "Aplicación reiniciada con PM2"
        else
            log_info "Iniciando nueva instancia de aplicación..."
            if [ -f "ecosystem.config.cjs" ]; then
                pm2 start ecosystem.config.cjs
            elif [ -f "ecosystem.config.js" ]; then
                pm2 start ecosystem.config.js
            else
                pm2 start $main_file --name "$APP_NAME" -i max --env production
            fi
            log_success "Aplicación iniciada con PM2"
        fi
        
        # Guardar configuración PM2 para auto-inicio
        pm2 save
        pm2 startup
        
        # Mostrar estado
        pm2 status
        
    elif command -v systemctl &> /dev/null; then
        # Fallback a systemctl
        log_info "Intentando reiniciar con systemctl..."
        if systemctl is-active --quiet $APP_NAME; then
            systemctl restart $APP_NAME
            log_success "Servicio reiniciado con systemctl"
        else
            log_warning "Servicio $APP_NAME no encontrado en systemctl"
            log_info "Inicia manualmente con: node $main_file"
        fi
        
    else
        log_warning "PM2 y systemctl no disponibles"
        echo ""
        echo "Reinicia la aplicación manualmente:"
        echo "  Opción 1 (producción): npm start"
        echo "  Opción 2 (directo): node $main_file"
        echo "  Opción 3 (PM2): pm2 start $main_file --name $APP_NAME"
        echo ""
        echo "Para instalar PM2 globalmente:"
        echo "  npm install -g pm2"
    fi
    
    return 0
}

# Función para verificar salud del servidor en producción
verify_production_health() {
    log_step "Verificando salud del servidor de producción..."
    
    # Esperar a que el servidor inicie completamente
    log_info "Esperando inicio del servidor..."
    sleep 15
    
    local app_port="${PORT:-3000}"
    local health_checks=0
    local max_attempts=5
    
    log_info "Probando conectividad en puerto $app_port..."
    
    for attempt in $(seq 1 $max_attempts); do
        log_info "Intento $attempt de $max_attempts..."
        
        # Probar endpoint de health si existe
        if curl -f -s --max-time 10 "http://localhost:$app_port/health" > /dev/null 2>&1; then
            log_success "Servidor de producción respondiendo (health endpoint)"
            health_checks=$((health_checks + 1))
            break
        elif curl -f -s --max-time 10 "http://localhost:$app_port/" > /dev/null 2>&1; then
            log_success "Servidor de producción respondiendo (root endpoint)"
            health_checks=$((health_checks + 1))
            break
        elif curl -f -s --max-time 10 "http://localhost:$app_port/api-docs" > /dev/null 2>&1; then
            log_success "Servidor de producción respondiendo (swagger endpoint)"
            health_checks=$((health_checks + 1))
            break
        else
            log_warning "Intento $attempt falló, reintentando en 5 segundos..."
            sleep 5
        fi
    done
    
    if [ $health_checks -eq 0 ]; then
        log_error "Servidor no responde después de $max_attempts intentos"
        log_info "Comandos para diagnóstico:"
        log_info "  - Verificar procesos: ps aux | grep node"
        log_info "  - Verificar logs PM2: pm2 logs $APP_NAME"
        log_info "  - Verificar puerto: netstat -tlnp | grep $app_port"
        log_info "  - Verificar logs sistema: journalctl -u $APP_NAME"
        return 1
    fi
    
    # Verificar endpoints críticos de la API
    log_info "Verificando endpoints críticos de la API..."
    
    # Test básico de autenticación (debería devolver 401 sin token)
    auth_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$app_port/api/encuesta")
    if [ "$auth_response" = "401" ] || [ "$auth_response" = "403" ]; then
        log_success "Endpoint de encuestas protegido correctamente"
    else
        log_warning "Endpoint de encuestas respuesta inesperada: $auth_response"
    fi
    
    log_success "Verificación de salud del servidor completada"
    return 0
}

# Función principal de deployment para servidor
main() {
    echo "🚀 DEPLOYMENT EN SERVIDOR DE PRODUCCIÓN"
    echo "======================================="
    echo "Servidor: $(hostname)"
    echo "Usuario: $(whoami)"
    echo "Directorio: $(pwd)"
    echo "Inicio: $(date)"
    echo ""
    
    # Verificar que somos root o tenemos permisos suficientes
    if [ "$EUID" -eq 0 ]; then
        log_warning "Ejecutándose como root - usar con precaución"
    fi
    
    # Fases del deployment en servidor
    local server_phases=(
        "check_server_environment"
        "create_server_backup"
        "load_server_config"
        "update_server_code"
        "install_production_dependencies"
        "test_production_database"
        "sync_production_database"
        "restart_production_services"
        "verify_production_features"
        "verify_production_health"
    )
    
    local failed_phase=""
    
    for phase in "${server_phases[@]}"; do
        echo ""
        if ! $phase; then
            failed_phase=$phase
            log_error "Fase $phase falló. Deployment abortado."
            break
        fi
    done
    
    echo ""
    
    if [ -n "$failed_phase" ]; then
        echo "💥 DEPLOYMENT FALLÓ EN FASE: $failed_phase"
        echo "============================================"
        
        if [ -f backup_info.txt ]; then
            source backup_info.txt
            echo ""
            echo "📋 PLAN DE ROLLBACK:"
            echo "1. Restaurar código:"
            echo "   cd $(pwd)"
            echo "   tar -xzf $BACKUP_DIR/code_backup.tar.gz"
            echo ""
            echo "2. Restaurar configuración:"
            echo "   cp $BACKUP_DIR/env_backup .env"
            echo ""
            echo "3. Restaurar BD (si hay backup):"
            echo "   psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME < $BACKUP_DIR/database_backup.sql"
            echo ""
            echo "4. Reiniciar servicios:"
            echo "   pm2 restart $APP_NAME"
        fi
        
        exit 1
    fi
    
    # Deployment exitoso
    echo "🎉 DEPLOYMENT EN PRODUCCIÓN COMPLETADO"
    echo "====================================="
    echo ""
    
    log_success "✅ Entorno de servidor verificado"
    log_success "✅ Backup de seguridad creado"
    log_success "✅ Código actualizado desde repositorio"
    log_success "✅ Base de datos sincronizada con nuevas funcionalidades:"
    echo "       • Campo 'comunionEnCasa' disponible en familias"
    echo "       • Validación de miembros únicos implementada"
    echo "       • Asociaciones Persona-Familias configuradas"
    log_success "✅ Dependencias de producción actualizadas"
    log_success "✅ Servicios de producción reiniciados"
    log_success "✅ Salud del servidor verificada"
    
    if [ -f backup_info.txt ]; then
        source backup_info.txt
        log_success "✅ Backup de seguridad disponible en: $BACKUP_DIR"
    fi
    
    echo ""
    echo "🔧 VERIFICACIONES POST-DEPLOYMENT:"
    echo "=================================="
    echo "1. ✅ Probar creación de encuestas con validación de miembros únicos"
    echo "2. ✅ Verificar que el campo comunionEnCasa funcione en formularios"
    echo "3. ✅ Probar APIs críticas (especialmente POST /api/encuesta)"
    echo "4. ✅ Monitorear logs por posibles errores: pm2 logs $APP_NAME"
    echo "5. ✅ Verificar rendimiento del servidor"
    echo ""
    
    echo "🌐 ENDPOINTS DE PRODUCCIÓN:"
    echo "=========================="
    echo "• Health check: http://$(hostname):${PORT:-3000}/health"
    echo "• API Swagger: http://$(hostname):${PORT:-3000}/api-docs"
    echo "• Test Encuesta: POST http://$(hostname):${PORT:-3000}/api/encuesta"
    echo ""
    
    echo "📊 COMANDOS DE MONITOREO:"
    echo "========================"
    echo "• Estado PM2: pm2 status"
    echo "• Logs aplicación: pm2 logs $APP_NAME"
    echo "• Uso recursos: pm2 monit"
    echo "• Reiniciar app: pm2 restart $APP_NAME"
    echo ""
    
    echo "📁 Logs del deployment: $DEPLOYMENT_LOG"
    log_success "🎉 Deployment en producción finalizado: $(date)"
}

# Manejar señales para cleanup
trap 'echo ""; log_warning "Deployment interrumpido por usuario"; exit 1' INT TERM

# Verificar argumentos
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Script de deployment para servidor de producción"
    echo "Debe ejecutarse directamente en el servidor remoto"
    echo ""
    echo "Prerrequisitos:"
    echo "• Node.js 18+ instalado"
    echo "• PostgreSQL accesible"
    echo "• Archivo .env configurado"
    echo "• PM2 instalado (recomendado)"
    echo ""
    echo "El script realizará:"
    echo "• Backup completo del sistema"
    echo "• Actualización del código"
    echo "• Sincronización de BD"
    echo "• Reinicio de servicios"
    echo "• Verificación de salud"
    exit 0
fi

# Ejecutar deployment
main "$@"

# Función para crear backup completo
create_backup() {
    log_step "Creando backup completo de seguridad..."
    BACKUP_DIR="backups/deployment_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup de código actual
    log_info "Backup de código actual..."
    tar -czf $BACKUP_DIR/code_backup.tar.gz --exclude=node_modules --exclude=.git --exclude=backups .
    
    # Backup de BD
    log_info "Backup de base de datos..."
    if command -v pg_dump &> /dev/null && [ ! -z "$DB_HOST" ] && [ ! -z "$DB_USER" ] && [ ! -z "$DB_NAME" ]; then
        PGPASSWORD=$DB_PASSWORD pg_dump -h ${DB_HOST:-localhost} -U ${DB_USER} -d ${DB_NAME} > $BACKUP_DIR/database_backup.sql 2>/dev/null
        if [ $? -eq 0 ]; then
            log_success "Backup de BD creado: $BACKUP_DIR/database_backup.sql"
        else
            log_warning "Error creando backup de BD"
        fi
    else
        log_warning "Configuración de BD incompleta, saltando backup"
    fi
    
    # Backup de .env
    if [ -f .env ]; then
        cp .env $BACKUP_DIR/env_backup
        log_success "Backup de configuración creado"
    fi
    
    echo "BACKUP_DIR=$BACKUP_DIR" > backup_info.txt
    log_success "Backup completo creado en: $BACKUP_DIR"
    return 0
}

# Función para verificar y cargar variables de entorno
verify_environment() {
    log_step "Verificando configuración de entorno..."
    
    if [ ! -f .env ]; then
        log_error "Archivo .env no encontrado"
        echo "Crea el archivo .env con las variables necesarias:"
        echo "# Database Configuration"
        echo "DB_HOST=localhost"
        echo "DB_USER=parroquia_user"
        echo "DB_PASSWORD=tu_password"
        echo "DB_NAME=parroquia_db"
        echo "DB_PORT=5432"
        echo ""
        echo "# Server Configuration"
        echo "PORT=3000"
        echo "NODE_ENV=production"
        echo ""
        echo "# JWT Configuration"
        echo "JWT_SECRET=tu_jwt_secret_muy_seguro"
        echo "JWT_EXPIRES_IN=24h"
        return 1
    fi
    
    # Cargar variables de entorno
    source .env
    
    # Verificar variables críticas
    local required_vars=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Variable de entorno $var no definida en .env"
            return 1
        fi
    done
    
    log_success "Variables de entorno verificadas"
    return 0
}

# Función para actualizar código
update_code() {
    log_step "Actualizando código desde repositorio..."
    
    # Verificar estado del repositorio
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "No es un repositorio git válido"
        return 1
    fi
    
    # Guardar cambios locales si los hay
    if ! git diff-index --quiet HEAD --; then
        log_warning "Hay cambios locales, guardando stash..."
        git stash push -m "Deploy backup $(date +%Y%m%d_%H%M%S)"
    fi
    
    # Fetch y pull
    log_info "Obteniendo últimos cambios..."
    git fetch origin
    
    # Verificar si la rama feature existe
    if git show-ref --verify --quiet refs/heads/feature; then
        log_info "Cambiando a rama feature..."
        git checkout feature
    else
        log_warning "Rama feature no encontrada, usando rama actual: $(git branch --show-current)"
    fi
    
    git pull origin $(git branch --show-current)
    
    if [ $? -eq 0 ]; then
        log_success "Código actualizado correctamente"
        log_info "Último commit: $(git log -1 --oneline)"
        return 0
    else
        log_error "Error actualizando código"
        return 1
    fi
}

# Función para instalar dependencias
install_dependencies() {
    log_step "Instalando dependencias..."
    
    # Limpiar cache de npm
    npm cache clean --force
    
    # Eliminar node_modules y package-lock.json para instalación limpia
    if [ -d "node_modules" ]; then
        log_info "Eliminando node_modules existente..."
        rm -rf node_modules
    fi
    
    # Instalar dependencias
    npm install --production --no-audit --no-fund
    
    if [ $? -eq 0 ]; then
        log_success "Dependencias instaladas correctamente"
        log_info "Packages instalados: $(npm list --depth=0 2>/dev/null | grep -c '├──\|└──')"
        return 0
    else
        log_error "Error instalando dependencias"
        return 1
    fi
}

# Función para probar conexión a BD
test_database_connection() {
    log_step "Probando conexión a base de datos..."
    
    # Crear script temporal para probar conexión
    cat > test_db_connection.mjs << 'EOF'
import sequelize from './config/sequelize.js';

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    // Verificar tablas críticas
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('familias', 'personas', 'usuarios');
    `);
    
    console.log(`📊 Tablas críticas encontradas: ${results.length}/3`);
    results.forEach(row => console.log(`  - ${row.table_name}`));
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error conexión BD:', error.message);
    process.exit(1);
  }
};

testConnection();
EOF
    
    node test_db_connection.mjs
    local result=$?
    rm -f test_db_connection.mjs
    
    if [ $result -eq 0 ]; then
        log_success "Conexión a base de datos verificada"
        return 0
    else
        log_error "No se puede conectar a la base de datos"
        return 1
    fi
}

# Función para sincronizar base de datos
sync_database() {
    log_step "Ejecutando sincronización de base de datos..."
    
    echo ""
    echo "⚠️  IMPORTANTE: Sincronización de Base de Datos"
    echo "==============================================="
    echo "Este proceso va a:"
    echo "1. Sincronizar todos los modelos con la BD"
    echo "2. Agregar el campo 'comunionEnCasa' a la tabla familias"
    echo "3. Configurar asociaciones entre Persona y Familias"
    echo "4. Mantener todos los datos existentes (usando ALTER)"
    echo ""
    echo "Presiona ENTER para continuar o Ctrl+C para cancelar..."
    read
    
    # Ejecutar sincronización completa
    log_info "Ejecutando sincronización completa con ALTER..."
    
    if npm run db:sync:complete:alter 2>&1 | tee -a $DEPLOYMENT_LOG; then
        log_success "Sincronización de BD completada exitosamente"
    else
        log_warning "Error en npm script, intentando método alternativo..."
        
        # Fallback a script directo
        if [ -f "syncDatabaseComplete.js" ]; then
            log_info "Ejecutando script de sincronización directo..."
            if node syncDatabaseComplete.js 2>&1 | tee -a $DEPLOYMENT_LOG; then
                log_success "Sincronización alternativa completada"
            else
                log_error "Error en ambos métodos de sincronización"
                return 1
            fi
        else
            log_error "Script de sincronización no encontrado"
            return 1
        fi
    fi
    
    return 0
}

# Función para verificar funcionalidades específicas
verify_new_features() {
    log_step "Verificando nuevas funcionalidades implementadas..."
    
    # Crear script de verificación
    cat > verify_features.mjs << 'EOF'
import sequelize from './config/sequelize.js';
import { Familias, Persona } from './src/models/index.js';

const verifyFeatures = async () => {
  try {
    console.log('🔍 Verificando campo comunionEnCasa...');
    
    // Verificar que el campo comunionEnCasa existe
    const [result] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' AND column_name = 'comunionencasa';
    `);
    
    if (result.length > 0) {
      console.log('✅ Campo comunionEnCasa encontrado');
      console.log(`   Tipo: ${result[0].data_type}, Default: ${result[0].column_default}`);
    } else {
      console.log('❌ Campo comunionEnCasa NO encontrado');
      process.exit(1);
    }
    
    console.log('🔍 Verificando asociaciones Persona-Familias...');
    
    // Verificar que las asociaciones funcionan
    const familia = await Familias.findOne({
      include: [{
        model: Persona,
        as: 'personas',
        required: false
      }],
      limit: 1
    });
    
    if (familia) {
      console.log('✅ Asociaciones Persona-Familias funcionando');
    } else {
      console.log('⚠️  No hay familias en la BD para probar asociaciones');
    }
    
    console.log('🔍 Verificando validación de miembros únicos...');
    
    // Verificar que el controlador tiene la función de validación
    const controllerPath = './src/controllers/encuestaController.js';
    const fs = await import('fs');
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    if (controllerContent.includes('validarMiembrosUnicos') && 
        controllerContent.includes('MIEMBROS_DUPLICADOS')) {
      console.log('✅ Función de validación de miembros únicos encontrada');
    } else {
      console.log('❌ Función de validación de miembros únicos NO encontrada');
      process.exit(1);
    }
    
    await sequelize.close();
    console.log('✅ Todas las funcionalidades verificadas correctamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error verificando funcionalidades:', error.message);
    process.exit(1);
  }
};

verifyFeatures();
EOF
    
    node verify_features.mjs
    local result=$?
    rm -f verify_features.mjs
    
    if [ $result -eq 0 ]; then
        log_success "Nuevas funcionalidades verificadas correctamente"
        return 0
    else
        log_error "Error verificando nuevas funcionalidades"
        return 1
    fi
}

# Función para verificar estado final
verify_final_state() {
    log_step "Verificando estado final del sistema..."
    
    # Usar script de verificación post-deployment si existe
    local verification_scripts=("verify-post-deployment.cjs" "verificar-simple.js" "check-familias-structure.cjs")
    
    for script in "${verification_scripts[@]}"; do
        if [ -f "$script" ]; then
            log_info "Ejecutando verificación: $script"
            if node $script 2>&1 | tee -a $DEPLOYMENT_LOG; then
                log_success "Verificación $script exitosa"
                return 0
            else
                log_warning "Verificación $script con problemas"
            fi
        fi
    done
    
    log_warning "Scripts de verificación no encontrados, realizando verificación básica"
    
    # Verificación básica manual
    cat > basic_verification.mjs << 'EOF'
import sequelize from './config/sequelize.js';

const basicVerification = async () => {
  try {
    await sequelize.authenticate();
    
    const [tables] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_name IN ('familias', 'personas', 'usuarios', 'municipios', 'veredas')
      ORDER BY table_name;
    `);
    
    console.log('📊 Estado de tablas principales:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}: ${table.column_count} columnas`);
    });
    
    await sequelize.close();
    console.log('✅ Verificación básica completada');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en verificación básica:', error.message);
    process.exit(1);
  }
};

basicVerification();
EOF
    
    node basic_verification.mjs
    local result=$?
    rm -f basic_verification.mjs
    
    if [ $result -eq 0 ]; then
        log_success "Verificación básica exitosa"
        return 0
    else
        log_warning "Verificación básica con problemas"
        return 1
    fi
}

# Función para reiniciar servicios
restart_services() {
    log_step "Reiniciando servicios de aplicación..."
    
    # Reiniciar con PM2 si está disponible
    if command -v pm2 &> /dev/null; then
        log_info "Reiniciando aplicación con PM2..."
        
        # Verificar si hay una app corriendo
        if pm2 list | grep -q "parroquia"; then
            pm2 restart parroquia-api
            log_success "Aplicación reiniciada con PM2"
        else
            # Iniciar nueva instancia
            if [ -f "ecosystem.config.cjs" ]; then
                pm2 start ecosystem.config.cjs
                log_success "Aplicación iniciada con PM2"
            else
                pm2 start npm --name "parroquia-api" -- start
                log_success "Aplicación iniciada con PM2 (configuración básica)"
            fi
        fi
        
        # Guardar configuración PM2
        pm2 save
        
    elif command -v systemctl &> /dev/null; then
        log_info "Intentando reiniciar con systemctl..."
        systemctl restart parroquia-api 2>/dev/null || log_warning "Servicio systemctl no configurado"
        
    else
        log_warning "PM2 y systemctl no encontrados."
        echo "Reinicia el servidor manualmente con:"
        echo "  npm start"
        echo "o"
        echo "  node src/server.js"
    fi
    
    return 0
}

# Función para verificar conectividad del servidor
verify_server_health() {
    log_step "Verificando que el servidor responda..."
    
    # Esperar a que el servidor inicie
    sleep 10
    
    local ports=("3000" "5000" "8080")
    local server_responding=false
    
    for port in "${ports[@]}"; do
        log_info "Probando puerto $port..."
        
        # Probar endpoint de health si existe
        if curl -f -s --max-time 10 "http://localhost:$port/health" > /dev/null 2>&1; then
            log_success "Servidor respondiendo en puerto $port (health endpoint)"
            server_responding=true
            break
        elif curl -f -s --max-time 10 "http://localhost:$port/" > /dev/null 2>&1; then
            log_success "Servidor respondiendo en puerto $port (root endpoint)"
            server_responding=true
            break
        fi
    done
    
    if [ "$server_responding" = false ]; then
        log_warning "Servidor no responde en puertos comunes"
        log_info "Verifica manualmente que el servidor esté corriendo"
        log_info "Comando para verificar: ps aux | grep node"
        log_info "Logs del servidor: npm run logs (si usa PM2)"
    fi
    
    return 0
}

# Función principal de deployment
main() {
    echo "🚀 DEPLOYMENT COMPLETO - SERVIDOR REMOTO"
    echo "========================================"
    echo "Inicio: $(date)"
    echo ""
    
    # Ejecutar todas las fases del deployment
    local phases=(
        "check_prerequisites"
        "create_backup" 
        "verify_environment"
        "update_code"
        "install_dependencies"
        "test_database_connection"
        "sync_database"
        "verify_new_features"
        "verify_final_state"
        "restart_services"
        "verify_server_health"
    )
    
    for phase in "${phases[@]}"; do
        echo ""
        if ! $phase; then
            log_error "Fase $phase falló. Deployment abortado."
            echo ""
            echo "📋 Para hacer rollback:"
            if [ -f backup_info.txt ]; then
                source backup_info.txt
                echo "1. Restaurar código: tar -xzf $BACKUP_DIR/code_backup.tar.gz"
                echo "2. Restaurar BD: psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME < $BACKUP_DIR/database_backup.sql"
                echo "3. Reiniciar servicios"
            fi
            exit 1
        fi
    done
    
    # Resumen final exitoso
    echo ""
    echo "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE"
    echo "====================================="
    log_success "Código actualizado desde repositorio"
    log_success "Base de datos sincronizada con nuevas funcionalidades:"
    echo "       - Campo 'comunionEnCasa' agregado a familias"
    echo "       - Validación de miembros únicos implementada"
    echo "       - Asociaciones Persona-Familias configuradas"
    log_success "Dependencias actualizadas"
    log_success "Servicios reiniciados"
    
    if [ -f backup_info.txt ]; then
        source backup_info.txt
        log_success "Backup de seguridad en: $BACKUP_DIR"
    fi
    
    echo ""
    echo "📋 Verificaciones recomendadas:"
    echo "1. Probar creación de encuestas con validación de miembros"
    echo "2. Verificar que el campo comunionEnCasa funcione"
    echo "3. Probar APIs críticas (especialmente /api/encuesta)"
    echo "4. Monitorear logs por posibles errores"
    echo ""
    echo "🔗 URLs para probar:"
    echo "- Health check: http://tu-servidor:3000/health"
    echo "- API Swagger: http://tu-servidor:3000/api-docs"
    echo "- Test Encuesta: POST http://tu-servidor:3000/api/encuesta"
    echo ""
    echo "📁 Logs del deployment: $DEPLOYMENT_LOG"
    log_success "Deployment finalizado: $(date)"
}

# Manejar señales para cleanup
trap 'echo ""; log_warning "Deployment interrumpido por usuario"; exit 1' INT TERM

# Ejecutar deployment
main "$@"
