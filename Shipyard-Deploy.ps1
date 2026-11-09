# ==============================================================================
#  SHIPYARD ENTERPRISE AUTOMATED DEPLOYMENT & SCAFFOLDING ENGINE
#  Target Environment: Windows 11 PowerShell / Coolify / Docker Desktop
# ==============================================================================

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "🚀 [SHIPYARD] Starting Enterprise Production Orchestration..." -ForegroundColor Cyan

# 1. Environment Verification
If (-Not (Test-Path ".env")) {
    Write-Host "⚠️ .env file missing! Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 2. Dependency Audit & Installation
Write-Host "📦 [SHIPYARD] Checking and synchronizing dependencies..." -ForegroundColor Cyan
npm ci

# 3. Prisma Database Migration & Client Generation
Write-Host "🗄️ [SHIPYARD] Running Prisma Schema Sync..." -ForegroundColor Cyan
npx prisma generate
npx prisma db push --skip-generate

# 4. Production Build Trigger
Write-Host "🏗️ [SHIPYARD] Executing Next.js Production Build..." -ForegroundColor Cyan
npm run build

# 5. Docker Orchestration Build
Write-Host "🐳 [SHIPYARD] Building Production Docker Container..." -ForegroundColor Cyan
docker-compose -f docker-compose.yml up --build -d

Write-Host "✅ [SHIPYARD] Deployment successfully operational!" -ForegroundColor Green
Write-Host "🌐 Application Endpoint: http://localhost:3000" -ForegroundColor BrightWhite
