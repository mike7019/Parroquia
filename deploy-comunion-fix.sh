#!/bin/bash

echo "🚀 Deploying comunionEnCasa column fix to production..."

# Check if we can connect to the production server
echo "📡 Testing connection to production server..."
if ! ping -c 1 206.62.139.11 &> /dev/null; then
    echo "❌ Cannot reach production server at 206.62.139.11"
    echo "ℹ️ Manual deployment required. Please run the following commands on the production server:"
    echo ""
    echo "1. SSH into the production server:"
    echo "   ssh ubuntu@206.62.139.11"
    echo ""
    echo "2. Navigate to the project directory:"
    echo "   cd /home/l4bs/parroquia/backend/Parroquia"
    echo ""
    echo "3. Run the migration script inside the Docker container:"
    echo "   docker-compose exec api node add-comunion-en-casa-column.js"
    echo ""
    echo "4. Restart the API service:"
    echo "   docker-compose restart api"
    echo ""
    echo "🔧 Alternative: Copy the migration script to production and run it:"
    echo "   scp add-comunion-en-casa-column.js ubuntu@206.62.139.11:/home/l4bs/parroquia/backend/Parroquia/"
    echo ""
    exit 1
fi

# If we can connect, try to run the deployment
echo "✅ Connection successful, proceeding with deployment..."

# Copy the migration script to production
echo "📤 Copying migration script to production..."
scp add-comunion-en-casa-column.js ubuntu@206.62.139.11:/home/l4bs/parroquia/backend/Parroquia/

# SSH into production and run the migration
echo "🔧 Running migration on production..."
ssh ubuntu@206.62.139.11 << 'EOF'
cd /home/l4bs/parroquia/backend/Parroquia

echo "📋 Current Docker containers:"
docker-compose ps

echo "🔧 Running migration inside Docker container..."
docker-compose exec -T api node add-comunion-en-casa-column.js

echo "🔄 Restarting API service..."
docker-compose restart api

echo "✅ Migration completed. Checking service status..."
docker-compose ps api

echo "🔍 Checking recent logs..."
docker-compose logs --tail=20 api
EOF

echo "🎉 Deployment completed!"
echo "🔍 Please check the production API at http://206.62.139.100:3000/api-docs to verify the fix"
