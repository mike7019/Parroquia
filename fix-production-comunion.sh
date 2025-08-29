#!/bin/bash

echo "🚀 Fixing comunionEnCasa column on production server..."

# Variables
SERVER="206.62.139.11"
USER="ubuntu"
PROJECT_PATH="/home/l4bs/parroquia/backend/Parroquia"

echo "📡 Connecting to production server: $SERVER"

# Execute commands on production server
ssh $USER@$SERVER << 'EOF'
    echo "📁 Navigating to project directory..."
    su
    sleep 1000
    adminred10
    cd /home/l4bs/parroquia/backend/Parroquia
    
    echo "📋 Current container status:"
    docker-compose ps
    
    echo "🔧 Executing database sync with alter flag..."
    docker-compose exec -T api npm run db:sync:complete alter
    
    echo "🔄 Restarting API service to ensure changes take effect..."
    docker-compose restart api
    
    echo "⏳ Waiting for service to start..."
    sleep 10
    
    echo "✅ Checking service status:"
    docker-compose ps api
    
    echo "📋 Recent logs (last 20 lines):"
    docker-compose logs --tail=20 api
    
    echo "🔍 Testing database connection..."
    docker-compose exec -T api node -e "
        const { Sequelize } = require('sequelize');
        const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false
        });
        
        (async () => {
            try {
                await sequelize.authenticate();
                const [results] = await sequelize.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'familias\' AND column_name = \'comunionEnCasa\';');
                if (results.length > 0) {
                    console.log('✅ Column comunionEnCasa exists in production database');
                } else {
                    console.log('❌ Column comunionEnCasa still missing');
                }
            } catch (error) {
                console.error('❌ Database error:', error.message);
            } finally {
                await sequelize.close();
            }
        })();
    "
EOF

echo ""
echo "🎉 Production deployment completed!"
echo "🔍 Please test the API at: http://206.62.139.100:3000/api-docs"
echo "📋 Try the GET /api/encuesta endpoint to verify the fix"
