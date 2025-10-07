# Script para deployar el fix de salud en el servidor remoto
# Servidor: 206.62.139.11
# Usuario: ubuntu

Write-Host "🚀 Iniciando deployment del fix de salud en servidor remoto..." -ForegroundColor Green
Write-Host ""

$SERVER = "ubuntu@206.62.139.11"
$PROJECT_PATH = "/home/ubuntu/Parroquia"  # Ajusta según tu servidor

Write-Host "📡 Conectando a servidor remoto: $SERVER" -ForegroundColor Cyan
Write-Host "📁 Ruta del proyecto: $PROJECT_PATH" -ForegroundColor Cyan
Write-Host ""

# Comando SSH con todos los pasos
$sshCommand = @"
cd $PROJECT_PATH && \
echo '📦 Estado actual del repositorio:' && \
git status && \
echo '' && \
echo '🔄 Haciendo pull de los cambios desde develop...' && \
git checkout develop && \
git pull origin develop && \
echo '' && \
echo '📋 Últimos commits:' && \
git log --oneline -5 && \
echo '' && \
echo '🔄 Reiniciando la aplicación...' && \
(pm2 restart parroquia-api || pm2 restart all || docker-compose restart api || echo '⚠️  Reinicia manualmente') && \
echo '' && \
echo '⏳ Esperando 5 segundos...' && \
sleep 5 && \
echo '' && \
echo '🧪 Ejecutando script de migración...' && \
node scripts/migrar-parroquia-personas.cjs && \
echo '' && \
echo '✅ Deployment completado!'
"@

Write-Host "🔧 Ejecutando comandos en el servidor..." -ForegroundColor Yellow
ssh $SERVER $sshCommand

Write-Host ""
Write-Host "✅ Deployment remoto completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Para probar el endpoint:" -ForegroundColor Cyan
Write-Host "   1. Obtener token:" -ForegroundColor Gray
Write-Host '      curl -X POST http://206.62.139.11:3000/api/auth/login -H "Content-Type: application/json" -d "{\"correo_electronico\":\"admin@parroquia.com\",\"contrasena\":\"Admin123!\"}"' -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Probar endpoint de salud:" -ForegroundColor Gray
Write-Host '      curl http://206.62.139.11:3000/api/personas/salud/parroquia/1 -H "Authorization: Bearer <token>"' -ForegroundColor Gray
