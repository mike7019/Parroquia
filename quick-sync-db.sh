#!/bin/bash

# 🚀 SINCRONIZACIÓN RÁPIDA DE BD - SERVIDOR
# Script para actualizar la BD del servidor rápidamente
# Solo agrega campos nuevos, no elimina datos

echo "🚀 SINCRONIZACIÓN RÁPIDA DE BASE DE DATOS"
echo "========================================"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar directorio
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No estás en el directorio del proyecto${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Directorio: $(pwd)${NC}"

# Crear script temporal de sincronización
cat > quick_sync.mjs << 'EOF'
import sequelize from './config/sequelize.js';

console.log('🚀 SINCRONIZACIÓN RÁPIDA INICIADA');
console.log('================================');

try {
  console.log('🔗 Conectando...');
  await sequelize.authenticate();
  
  console.log('🔄 Sincronizando (solo agregar)...');
  // Solo agregar columnas nuevas, no eliminar
  await sequelize.sync({ alter: true });
  
  console.log('🔍 Verificando comunionEnCasa...');
  const [check] = await sequelize.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'familias' 
    AND column_name = 'comunionEnCasa';
  `);
  
  if (check.length > 0) {
    console.log('✅ Campo comunionEnCasa: PRESENTE');
  } else {
    console.log('❌ Campo comunionEnCasa: NO ENCONTRADO');
  }
  
  console.log('🎉 SINCRONIZACIÓN COMPLETADA');
  process.exit(0);
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
} finally {
  await sequelize.close();
}
EOF

# Ejecutar
echo -e "${BLUE}⚡ Ejecutando sincronización...${NC}"
node quick_sync.mjs
RESULT=$?

# Limpiar
rm -f quick_sync.mjs

if [ $RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Sincronización rápida completada!${NC}"
    echo ""
    echo "🔧 Reinicia la aplicación si es necesario:"
    echo "   pm2 restart parroquia-api"
else
    echo -e "${RED}❌ Error en la sincronización${NC}"
fi
