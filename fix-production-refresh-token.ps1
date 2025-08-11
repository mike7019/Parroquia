# Script to add refresh_token column to production database
# This script safely adds the missing column that's causing authentication errors

Write-Host "🚀 Starting production database migration..." -ForegroundColor Green
Write-Host "📋 Task: Add refresh_token column to usuarios table" -ForegroundColor Yellow

# Step 1: Check current directory
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir"

# Step 2: Check if migration script exists
$migrationScript = "add-refresh-token-column.js"
if (-not (Test-Path $migrationScript)) {
    Write-Host "❌ Migration script not found: $migrationScript" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration script found: $migrationScript" -ForegroundColor Green

# Step 3: Run the migration
Write-Host "🔄 Running migration script..." -ForegroundColor Yellow

try {
    $result = node $migrationScript
    Write-Host $result
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host "🎉 The refresh_token column has been added to the usuarios table" -ForegroundColor Green
        Write-Host "🔄 You should now restart the Node.js server to resolve authentication errors" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error running migration: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your Node.js server (pm2 restart all or npm restart)" -ForegroundColor White
Write-Host "2. Test login functionality" -ForegroundColor White
Write-Host "3. Verify refresh token endpoints work correctly" -ForegroundColor White

Write-Host ""
Write-Host "🎯 The 'column Usuario.refresh_token does not exist' error should now be resolved!" -ForegroundColor Green
