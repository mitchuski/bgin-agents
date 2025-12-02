# BGIN AI MVP with Phala Cloud Startup Script
Write-Host "🚀 Starting BGIN AI MVP with Phala Cloud..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Please run this script from the bgin-ai-mvp directory" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please review and update as needed." -ForegroundColor Green
}

# Start core services
Write-Host "🔄 Starting core BGIN AI MVP services..." -ForegroundColor Blue
docker-compose up -d postgres redis qdrant backend frontend

# Wait for core services to be ready
Write-Host "⏳ Waiting for core services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Phala Cloud service
Write-Host "🔒 Starting Phala Cloud service..." -ForegroundColor Blue
docker-compose --profile phala up -d phala-cloud

# Wait for Phala Cloud to be ready
Write-Host "⏳ Waiting for Phala Cloud to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Display service status
Write-Host "`n🎉 BGIN AI MVP with Phala Cloud is running!" -ForegroundColor Green
Write-Host "`n📊 Service URLs:" -ForegroundColor Cyan
Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "  • Phala Cloud: http://localhost:3002" -ForegroundColor White
Write-Host "  • Health Check: http://localhost:4000/health" -ForegroundColor White
Write-Host "  • Phala API: http://localhost:3002/api" -ForegroundColor White

Write-Host "`n🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "  • View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  • Stop all: docker-compose down" -ForegroundColor White
Write-Host "  • Stop Phala: docker-compose --profile phala down" -ForegroundColor White
Write-Host "  • Restart: docker-compose restart" -ForegroundColor White

Write-Host "`n🔒 Phala Cloud Features:" -ForegroundColor Cyan
Write-Host "  • Confidential AI Computing" -ForegroundColor White
Write-Host "  • Hardware-level Privacy (TEE)" -ForegroundColor White
Write-Host "  • Verifiable Computation" -ForegroundColor White
Write-Host "  • Track-specific Processing" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep the script running and show logs
docker-compose logs -f
