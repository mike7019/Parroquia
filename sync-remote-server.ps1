# Remote Server Database Sync Script
# This script updates the database schema after repository changes

Write-Host "🚀 Starting Remote Server Database Sync..." -ForegroundColor Green
Write-Host "⚠️  This will recreate all database tables!" -ForegroundColor Yellow

try {
    # Step 1: Pull latest changes (if this is run on server)
    Write-Host "`n📥 Step 1: Checking for latest changes..." -ForegroundColor Cyan
    git pull origin main 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Repository updated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No git repository or unable to pull" -ForegroundColor Yellow
    }
    
    # Step 2: Install/update dependencies
    Write-Host "`n📦 Step 2: Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    
    # Step 3: Sync database
    Write-Host "`n📊 Step 3: Synchronizing database..." -ForegroundColor Cyan
    npm run db:sync:deploy
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to sync database"
    }
    
    # Step 4: Load catalog data
    Write-Host "`n🌱 Step 4: Loading catalog data..." -ForegroundColor Cyan
    npm run db:seed:config
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to load catalog data"
    }
    
    Write-Host "`n🎉 REMOTE SERVER SYNC COMPLETED!" -ForegroundColor Green
    Write-Host "🚀 Server is ready for operation" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ SYNC FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Manual intervention required" -ForegroundColor Yellow
    exit 1
}
