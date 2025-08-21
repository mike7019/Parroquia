# Jenkins Deployment Setup Guide - PowerShell Version
# Guía completa para configurar el despliegue con Jenkins

Write-Host "🚀 GUÍA DE CONFIGURACIÓN DE JENKINS PARA DESPLIEGUE" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PASO 1: CONFIGURACIÓN DEL SERVIDOR" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ejecuta estos comandos en tu servidor (206.62.139.100):" -ForegroundColor Cyan
Write-Host ""
Write-Host "# 1. Conectar al servidor" -ForegroundColor White
Write-Host "ssh l4bs@206.62.139.100" -ForegroundColor Gray
Write-Host ""
Write-Host "# 2. Crear directorio del proyecto" -ForegroundColor White
Write-Host "sudo mkdir -p /home/l4bs/parroquia/backend" -ForegroundColor Gray
Write-Host "sudo chown -R l4bs:l4bs /home/l4bs/parroquia" -ForegroundColor Gray
Write-Host ""
Write-Host "# 3. Clonar repositorio" -ForegroundColor White
Write-Host "cd /home/l4bs/parroquia/backend" -ForegroundColor Gray
Write-Host "git clone -b feature https://github.com/mike7019/Parroquia.git" -ForegroundColor Gray
Write-Host "cd Parroquia" -ForegroundColor Gray
Write-Host ""
Write-Host "# 4. Configurar variables de entorno" -ForegroundColor White
Write-Host "cp .env.production .env" -ForegroundColor Gray
Write-Host "# Editar .env con tus valores reales si es necesario" -ForegroundColor Gray
Write-Host "nano .env" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 PASO 2: CONFIGURACIÓN DE JENKINS" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "2.1. Instalar Jenkins (si no está instalado):" -ForegroundColor Cyan
Write-Host "cd jenkins" -ForegroundColor Gray
Write-Host "docker-compose up -d" -ForegroundColor Gray
Write-Host "# Jenkins estará disponible en: http://tu-ip:8081" -ForegroundColor Gray
Write-Host ""

Write-Host "2.2. Configurar credenciales SSH en Jenkins:" -ForegroundColor Cyan
Write-Host "- Ve a: Manage Jenkins > Manage Credentials" -ForegroundColor Gray
Write-Host "- Add Credentials > SSH Username with private key" -ForegroundColor Gray
Write-Host "- ID: servidor-produccion-ssh" -ForegroundColor Gray
Write-Host "- Username: l4bs" -ForegroundColor Gray
Write-Host "- Private Key: [Tu clave privada SSH]" -ForegroundColor Gray
Write-Host ""

Write-Host "2.3. Crear Pipeline Job:" -ForegroundColor Cyan
Write-Host "- New Item > Pipeline" -ForegroundColor Gray
Write-Host "- Name: Parroquia-Feature-Deploy" -ForegroundColor Gray
Write-Host "- Pipeline script from SCM" -ForegroundColor Gray
Write-Host "- Repository URL: https://github.com/mike7019/Parroquia.git" -ForegroundColor Gray
Write-Host "- Branch: */feature" -ForegroundColor Gray
Write-Host "- Script Path: jenkinsfile" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 PASO 3: VARIABLES DE ENTORNO EN EL SERVIDOR" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Asegúrate de que el archivo .env en el servidor tenga:" -ForegroundColor Cyan
Write-Host ""
Write-Host "NODE_ENV=production" -ForegroundColor Gray
Write-Host "PORT=3000" -ForegroundColor Gray
Write-Host "DB_HOST=postgres" -ForegroundColor Gray
Write-Host "DB_PASSWORD=ParroquiaSecure2025" -ForegroundColor Gray
Write-Host "JWT_SECRET=ParroquiaSecretKey2025VeryLongAndSecureForProductionUse123!" -ForegroundColor Gray
Write-Host "JWT_REFRESH_SECRET=ParroquiaRefreshSecretKey2025DifferentFromMainSecretForSecurity456!" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 PASO 4: EJECUTAR PRIMER DESPLIEGUE" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "4.1. Desde Jenkins, ejecuta el pipeline manualmente" -ForegroundColor Cyan
Write-Host "4.2. O haz un push a la rama feature para activar el webhook" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PASO 5: VERIFICACIÓN POST-DESPLIEGUE" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Comandos para verificar en el servidor:" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Ver estado de contenedores" -ForegroundColor White
Write-Host "docker-compose ps" -ForegroundColor Gray
Write-Host ""
Write-Host "# Ver logs de la aplicación" -ForegroundColor White
Write-Host "docker-compose logs -f api" -ForegroundColor Gray
Write-Host ""
Write-Host "# Probar endpoint de salud" -ForegroundColor White
Write-Host "curl http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "# Probar endpoint de login" -ForegroundColor White
Write-Host 'curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '"'"'{"correo_electronico":"admin@test.com","contrasena":"Admin123!"}'"'"'' -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 TROUBLESHOOTING COMÚN" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si la aplicación no inicia:" -ForegroundColor Cyan
Write-Host "1. docker-compose logs api" -ForegroundColor Gray
Write-Host "2. docker-compose restart api" -ForegroundColor Gray
Write-Host "3. Verificar variables en .env" -ForegroundColor Gray
Write-Host ""
Write-Host "Si la base de datos no conecta:" -ForegroundColor Cyan
Write-Host "1. docker-compose logs postgres" -ForegroundColor Gray
Write-Host "2. Verificar DB_PASSWORD en .env" -ForegroundColor Gray
Write-Host ""
Write-Host "Si hay problemas de permisos:" -ForegroundColor Cyan
Write-Host "sudo chown -R l4bs:l4bs /home/l4bs/parroquia" -ForegroundColor Gray
Write-Host "sudo usermod -aG docker l4bs" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ ENDPOINTS IMPORTANTES" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Health Check: http://206.62.139.100:3000/api/health" -ForegroundColor Green
Write-Host "Login: http://206.62.139.100:3000/api/auth/login" -ForegroundColor Green
Write-Host "Veredas: http://206.62.139.100:3000/api/catalog/veredas" -ForegroundColor Green
Write-Host "Municipios: http://206.62.139.100:3000/api/catalog/municipios" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 CONFIGURACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""
Write-Host "Tu aplicación está lista para el despliegue automático con Jenkins." -ForegroundColor White
Write-Host "Cada push a la rama 'feature' activará el pipeline de despliegue." -ForegroundColor White
Write-Host ""
