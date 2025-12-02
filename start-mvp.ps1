# BGIN AI MVP Startup Script for Windows
# This script provides multiple deployment options

Write-Host "🚀 BGIN AI MVP Startup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your configuration." -ForegroundColor Green
}

# Function to check if Docker is available
function Test-Docker {
    try {
        docker --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if Node.js is available
function Test-Node {
    try {
        node --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Main menu
Write-Host "`nChoose deployment method:" -ForegroundColor Cyan
Write-Host "1. Docker (Recommended - requires Docker Desktop)" -ForegroundColor White
Write-Host "2. Manual (Node.js + PostgreSQL + Redis)" -ForegroundColor White
Write-Host "3. Development Mode (Node.js only)" -ForegroundColor White
Write-Host "4. Check System Requirements" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n🐳 Starting with Docker..." -ForegroundColor Blue
        
        if (-not (Test-Docker)) {
            Write-Host "❌ Docker is not installed or not running." -ForegroundColor Red
            Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Starting services with Docker Compose..." -ForegroundColor Green
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Services started successfully!" -ForegroundColor Green
            Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
            Write-Host "Health Check: http://localhost:4000/health" -ForegroundColor Cyan
            Write-Host "`nTo view logs: docker-compose logs -f" -ForegroundColor Yellow
            Write-Host "To stop services: docker-compose down" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Failed to start services. Check logs with: docker-compose logs" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host "`n🔧 Starting Manual Deployment..." -ForegroundColor Blue
        
        if (-not (Test-Node)) {
            Write-Host "❌ Node.js is not installed." -ForegroundColor Red
            Write-Host "Please install Node.js 18+ from: https://nodejs.org/" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Installing dependencies..." -ForegroundColor Green
        npm install
        
        Write-Host "`n⚠️  Manual deployment requires:" -ForegroundColor Yellow
        Write-Host "- PostgreSQL 15+ running on localhost:5432" -ForegroundColor White
        Write-Host "- Redis 7+ running on localhost:6379" -ForegroundColor White
        Write-Host "- Database 'bgin_mvp' created" -ForegroundColor White
        Write-Host "- Database initialized with init-db.sql" -ForegroundColor White
        
        $continue = Read-Host "`nContinue? (y/n)"
        if ($continue -eq "y" -or $continue -eq "Y") {
            Write-Host "Starting backend..." -ForegroundColor Green
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
            
            Write-Host "Starting frontend..." -ForegroundColor Green
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
            
            Write-Host "`n✅ Services starting in separate windows!" -ForegroundColor Green
            Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
        }
    }
    
    "3" {
        Write-Host "`n🛠️  Starting Development Mode..." -ForegroundColor Blue
        
        if (-not (Test-Node)) {
            Write-Host "❌ Node.js is not installed." -ForegroundColor Red
            Write-Host "Please install Node.js 18+ from: https://nodejs.org/" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Installing dependencies..." -ForegroundColor Green
        npm install
        
        Write-Host "Starting development servers..." -ForegroundColor Green
        npm run dev
        
        Write-Host "`n✅ Development servers started!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
        Write-Host "`nNote: This mode uses mock data and doesn't require databases." -ForegroundColor Yellow
    }
    
    "4" {
        Write-Host "`n🔍 System Requirements Check" -ForegroundColor Blue
        Write-Host "=============================" -ForegroundColor Blue
        
        # Check Docker
        if (Test-Docker) {
            Write-Host "✅ Docker: Available" -ForegroundColor Green
            docker --version
        } else {
            Write-Host "❌ Docker: Not available" -ForegroundColor Red
        }
        
        # Check Node.js
        if (Test-Node) {
            Write-Host "✅ Node.js: Available" -ForegroundColor Green
            node --version
        } else {
            Write-Host "❌ Node.js: Not available" -ForegroundColor Red
        }
        
        # Check npm
        try {
            npm --version | Out-Null
            Write-Host "✅ npm: Available" -ForegroundColor Green
            npm --version
        }
        catch {
            Write-Host "❌ npm: Not available" -ForegroundColor Red
        }
        
        # Check Git
        try {
            git --version | Out-Null
            Write-Host "✅ Git: Available" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Git: Not available" -ForegroundColor Red
        }
        
        Write-Host "`nFor full functionality, you need:" -ForegroundColor Yellow
        Write-Host "- Docker Desktop (for containerized deployment)" -ForegroundColor White
        Write-Host "- Node.js 18+ (for manual deployment)" -ForegroundColor White
        Write-Host "- PostgreSQL 15+ (for manual deployment)" -ForegroundColor White
        Write-Host "- Redis 7+ (for manual deployment)" -ForegroundColor White
    }
    
    "5" {
        Write-Host "👋 Goodbye!" -ForegroundColor Green
        exit 0
    }
    
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n📚 For more information, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "🐛 For issues, check the logs or contact support" -ForegroundColor Cyan
