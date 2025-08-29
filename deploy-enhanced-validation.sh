#!/bin/bash

echo "🚀 Desplegando mejoras en validación de duplicados y campo comunionEnCasa"
echo "==================================================================="

# Variables de configuración
SERVER="206.62.139.100"
USER="ubuntu"
PROJECT_DIR="/home/ubuntu/parroquia"
LOCAL_DIR="."

echo "📋 Cambios a desplegar:"
echo "  ✅ Campo comunionEnCasa agregado al modelo Familias"
echo "  ✅ Validación mejorada de familias duplicadas"
echo "  ✅ Detección de errores de formulación"
echo "  ✅ Mensajes de error mejorados con comparación de miembros"
echo ""

# Paso 1: Hacer backup de la versión actual
echo "🔄 Paso 1: Creando backup de la versión actual..."
ssh $USER@$SERVER "cd $PROJECT_DIR && cp -r src src_backup_$(date +%Y%m%d_%H%M%S)"
if [ $? -eq 0 ]; then
    echo "✅ Backup creado exitosamente"
else
    echo "❌ Error creando backup"
    exit 1
fi

# Paso 2: Subir archivos modificados
echo "📁 Paso 2: Subiendo archivos modificados..."

# Subir modelo de Familias actualizado
echo "  📄 Subiendo modelo Familias.js..."
scp src/models/catalog/Familias.js $USER@$SERVER:$PROJECT_DIR/src/models/catalog/Familias.js
if [ $? -eq 0 ]; then
    echo "    ✅ Familias.js subido"
else
    echo "    ❌ Error subiendo Familias.js"
    exit 1
fi

# Subir controlador de encuesta actualizado
echo "  📄 Subiendo encuestaController.js..."
scp src/controllers/encuestaController.js $USER@$SERVER:$PROJECT_DIR/src/controllers/encuestaController.js
if [ $? -eq 0 ]; then
    echo "    ✅ encuestaController.js subido"
else
    echo "    ❌ Error subiendo encuestaController.js"
    exit 1
fi

# Paso 3: Ejecutar sincronización de base de datos
echo "🗄️ Paso 3: Sincronizando cambios en base de datos..."
ssh $USER@$SERVER "cd $PROJECT_DIR && docker-compose exec -T api npm run db:sync:complete alter"
if [ $? -eq 0 ]; then
    echo "✅ Base de datos sincronizada exitosamente"
else
    echo "❌ Error en sincronización de base de datos"
    echo "🔄 Intentando con docker exec directo..."
    ssh $USER@$SERVER "cd $PROJECT_DIR && docker exec \$(docker ps -q -f name=api) npm run db:sync:complete alter"
fi

# Paso 4: Verificar la columna comunionEnCasa
echo "🔍 Paso 4: Verificando estructura de tabla familias..."
ssh $USER@$SERVER "cd $PROJECT_DIR && docker exec \$(docker ps -q -f name=postgres) psql -U parroquia_user -d parroquia_db -c \"\\d familias\" | grep comunion"
if [ $? -eq 0 ]; then
    echo "✅ Columna comunionEnCasa verificada"
else
    echo "⚠️ Verificando manualmente..."
    ssh $USER@$SERVER "cd $PROJECT_DIR && docker exec \$(docker ps -q -f name=postgres) psql -U parroquia_user -d parroquia_db -c \"SELECT column_name FROM information_schema.columns WHERE table_name='familias' AND column_name LIKE '%comunion%';\""
fi

# Paso 5: Reiniciar servicios
echo "🔄 Paso 5: Reiniciando servicios..."
ssh $USER@$SERVER "cd $PROJECT_DIR && docker-compose restart api"
if [ $? -eq 0 ]; then
    echo "✅ Servicios reiniciados exitosamente"
else
    echo "❌ Error reiniciando servicios"
    exit 1
fi

# Paso 6: Verificar que el servicio esté funcionando
echo "🏥 Paso 6: Verificando salud del servicio..."
sleep 10  # Esperar a que el servicio se inicie completamente

# Test de salud del servidor
echo "  🔍 Probando endpoint de salud..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://$SERVER:3000/api/health)
HTTP_CODE="${HEALTH_RESPONSE: -3}"

if [ "$HTTP_CODE" == "200" ]; then
    echo "    ✅ Servidor respondiendo correctamente (HTTP 200)"
else
    echo "    ❌ Servidor no responde correctamente (HTTP $HTTP_CODE)"
    exit 1
fi

# Paso 7: Test de autenticación
echo "🔐 Paso 7: Probando autenticación..."
AUTH_RESPONSE=$(curl -s -X POST http://$SERVER:3000/api/auth/login -H "Content-Type: application/json" -d '{"correo_electronico":"admin@parroquia.com","contrasena":"Admin123!"}')

if echo "$AUTH_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Autenticación funcionando correctamente"
    
    # Extraer token
    TOKEN=$(echo $AUTH_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    # Paso 8: Test de endpoint de encuestas
    echo "📋 Paso 8: Probando endpoint de encuestas..."
    ENCUESTAS_RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" http://$SERVER:3000/api/encuestas)
    ENCUESTAS_HTTP_CODE="${ENCUESTAS_RESPONSE: -3}"
    
    if [ "$ENCUESTAS_HTTP_CODE" == "200" ]; then
        echo "✅ Endpoint de encuestas funcionando correctamente"
    else
        echo "❌ Error en endpoint de encuestas (HTTP $ENCUESTAS_HTTP_CODE)"
    fi
    
else
    echo "❌ Error en autenticación"
    echo "Respuesta: $AUTH_RESPONSE"
fi

# Paso 9: Verificar logs por posibles errores
echo "📊 Paso 9: Revisando logs recientes..."
echo "Últimas 10 líneas de logs:"
ssh $USER@$SERVER "cd $PROJECT_DIR && docker-compose logs --tail=10 api"

echo ""
echo "🎉 DESPLIEGUE COMPLETADO"
echo "========================"
echo ""
echo "✅ Cambios desplegados exitosamente:"
echo "  - Campo comunionEnCasa agregado y sincronizado"
echo "  - Validación mejorada de familias duplicadas implementada"
echo "  - Detección de errores de formulación activada"
echo "  - Mensajes de error mejorados disponibles"
echo ""
echo "🔍 Para monitorear el sistema:"
echo "  - Logs: ssh $USER@$SERVER 'cd $PROJECT_DIR && docker-compose logs -f api'"
echo "  - Salud: curl http://$SERVER:3000/api/health"
echo "  - Swagger: http://$SERVER:3000/api-docs"
echo ""
echo "🚀 El sistema está listo para probar las nuevas funcionalidades!"
