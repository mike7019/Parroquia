# Script PowerShell para aplicar migración de solicitud_comunion_casa en servidor remoto
# Fecha: 2025-12-25
# Descripción: Agrega columna solicitud_comunion_casa a tabla personas

$SERVER = "ubuntu@206.62.139.11"
$CONTAINER_NAME = "parroquia-postgres-1"

Write-Host "🚀 Aplicando migración: solicitud_comunion_casa" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Conectando a servidor: $SERVER" -ForegroundColor Yellow
Write-Host ""

# Comando SQL
$SQL_COMMAND = "ALTER TABLE personas ADD COLUMN IF NOT EXISTS solicitud_comunion_casa BOOLEAN DEFAULT false;"

# Ejecutar migración via SSH
$result = ssh $SERVER @"
cd ~/Parroquia 2>/dev/null || cd /var/www/Parroquia 2>/dev/null || cd /home/ubuntu/Parroquia

echo '📂 Directorio actual:' \`$(pwd)
echo ''

# Verificar que Docker está corriendo
if ! docker ps &> /dev/null; then
    echo '❌ Error: Docker no está corriendo o no tienes permisos'
    exit 1
fi

# Ejecutar migración
echo '🔧 Ejecutando ALTER TABLE...'
docker exec $CONTAINER_NAME psql -U parroquia_user -d parroquia_db -c \"$SQL_COMMAND\"

if [ \`$? -eq 0 ]; then
    echo ''
    echo '✅ Migración aplicada exitosamente'
    echo ''
    echo '🔍 Verificando columna...'
    docker exec $CONTAINER_NAME psql -U parroquia_user -d parroquia_db -c \"
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'personas' AND column_name = 'solicitud_comunion_casa';
    \"
else
    echo ''
    echo '❌ Error al aplicar migración'
    exit 1
fi
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ Proceso completado exitosamente" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "❌ Error durante la ejecución" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    exit 1
}
