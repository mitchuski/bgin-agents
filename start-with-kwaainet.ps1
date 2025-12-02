# =====================================
# Start BGIN AI MVP with KwaaiNet Mock Server
# =====================================

Write-Host "🚀 Starting BGIN AI MVP with KwaaiNet Integration" -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if required packages are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start KwaaiNet Mock Server in background
Write-Host "🌐 Starting KwaaiNet Mock Server on port 8000..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "kwaainet-mock-server.js" -WindowStyle Hidden

# Wait for mock server to start
Write-Host "⏳ Waiting for KwaaiNet Mock Server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test KwaaiNet Mock Server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ KwaaiNet Mock Server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ KwaaiNet Mock Server may not be ready yet, continuing..." -ForegroundColor Yellow
}

# Start main BGIN AI MVP server
Write-Host "🤖 Starting BGIN AI MVP Server on port 4000..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Available endpoints:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:4000" -ForegroundColor White
Write-Host "   API Status: http://localhost:4000/api/status" -ForegroundColor White
Write-Host "   KwaaiNet Test: http://localhost:4000/api/test-kwaainet" -ForegroundColor White
Write-Host "   Chat API: http://localhost:4000/api/chat" -ForegroundColor White
Write-Host ""
Write-Host "🔧 LLM Configuration:" -ForegroundColor White
Write-Host "   Primary: KwaaiNet Mock Server (http://localhost:8000/v1)" -ForegroundColor White
Write-Host "   Fallback: OpenAI/Anthropic (if configured)" -ForegroundColor White
Write-Host ""

# Start the main server
node simple-server.js
