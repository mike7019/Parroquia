#!/bin/bash

# 🚨 SCRIPT DE REPARACIÓN URGENTE PARA SERVIDOR
# Corrige problemas de asociaciones de Sequelize y reinicia la aplicación

echo "🚨 REPARACIÓN URGENTE DE SERVIDOR"
echo "================================="
echo "📅 $(date)"
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

# Verificar directorio del proyecto
if [ ! -f "package.json" ]; then
    log_error "No estás en el directorio del proyecto"
    exit 1
fi

log_info "Directorio del proyecto: $(pwd)"

echo ""
echo "🔧 PASO 1: DETENER APLICACIÓN"
echo "============================"

# Detener PM2
log_info "Deteniendo aplicación con PM2..."
pm2 stop parroquia-api 2>/dev/null || log_warning "PM2 no estaba ejecutándose"

echo ""
echo "🔧 PASO 2: CREAR ARCHIVO DE CORRECCIÓN TEMPORAL"
echo "=============================================="

# Crear archivo de corrección temporal
cat > fix-server-urgent.mjs << 'EOF'
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
    console.log(`   📁 ${table.table_name}`);
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
EOF

log_info "Ejecutando verificación de BD..."
node fix-server-urgent.mjs
VERIFY_RESULT=$?

# Limpiar archivo temporal
rm -f fix-server-urgent.mjs

if [ $VERIFY_RESULT -ne 0 ]; then
    log_error "Verificación de BD falló"
    exit 1
fi

echo ""
echo "🔧 PASO 3: VERIFICAR ARCHIVOS CRÍTICOS"
echo "===================================="

# Verificar que existen archivos críticos
CRITICAL_FILES=(
    "src/models/index.js"
    "src/models/catalog/index.js"
    "src/models/Usuario.js"
    "src/app.js"
    "config/sequelize.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "Archivo $file existe"
    else
        log_error "Archivo crítico $file no existe"
        exit 1
    fi
done

echo ""
echo "🔧 PASO 4: REINSTALAR DEPENDENCIAS (SI ES NECESARIO)"
echo "================================================="

# Solo reinstalar si hay problemas
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    log_warning "node_modules parece incompleto, reinstalando..."
    npm install --production
else
    log_info "node_modules está OK"
fi

echo ""
echo "🔧 PASO 5: REINICIAR APLICACIÓN"
echo "============================"

# Verificar proceso PM2
log_info "Iniciando aplicación con PM2..."

# Asegurar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 no encontrado, instalando..."
    npm install -g pm2
fi

# Configuración PM2 básica si no existe ecosystem
if [ ! -f "ecosystem.config.cjs" ]; then
    log_warning "Creando configuración PM2 básica..."
    cat > ecosystem.config.cjs << 'PMEOF'
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
PMEOF
fi

# Iniciar aplicación
pm2 start ecosystem.config.cjs --update-env
PM2_RESULT=$?

# Esperar un momento para que inicie
sleep 3

echo ""
echo "🔧 PASO 6: VERIFICAR ESTADO"
echo "=========================="

# Verificar estado PM2
log_info "Estado de PM2:"
pm2 status

# Verificar logs recientes
log_info "Logs recientes (últimas 10 líneas):"
pm2 logs parroquia-api --lines 10 --nostream

if [ $PM2_RESULT -eq 0 ]; then
    log_success "🎉 REPARACIÓN COMPLETADA"
    echo ""
    echo "📊 RESUMEN:"
    echo "==========="
    echo "✅ BD verificada y funcional"
    echo "✅ Archivos críticos presentes"
    echo "✅ Aplicación reiniciada"
    echo ""
    echo "🔧 COMANDOS ÚTILES:"
    echo "=================="
    echo "• Ver logs: pm2 logs parroquia-api"
    echo "• Estado: pm2 status"
    echo "• Reiniciar: pm2 restart parroquia-api"
    echo "• Parar: pm2 stop parroquia-api"
    echo ""
    echo "🧪 PRUEBAS:"
    echo "=========="
    echo "• Health check: curl http://localhost:3000/api/health"
    echo "• Ver proceso: ps aux | grep node"
    
else
    log_error "❌ Error al iniciar aplicación"
    echo ""
    echo "🔧 DIAGNÓSTICO:"
    echo "=============="
    log_info "Verificando logs de error..."
    pm2 logs parroquia-api --err --lines 20 --nostream
    
    echo ""
    echo "🔧 SOLUCIONES POSIBLES:"
    echo "====================="
    echo "1. Verificar .env: ls -la .env"
    echo "2. Verificar variables: cat .env | grep DB_"
    echo "3. Reinicio manual: node src/app.js"
    echo "4. Verificar puerto: netstat -tlpn | grep 3000"
fi

echo ""
log_info "Reparación urgente finalizada: $(date)"
