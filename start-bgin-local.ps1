# BGIN Multi-Agent System with Phala Cloud - Local Startup Script
Write-Host "🚀 Starting BGIN Multi-Agent System with Phala Cloud Integration..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ Please run this script from the bgin-ai-mvp directory" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Expected: bgin-ai-mvp directory with frontend/ subdirectory" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found BGIN project structure" -ForegroundColor Green

# Test Phala Cloud connection
Write-Host "`nTesting Phala Cloud connection..." -ForegroundColor Blue
try {
    $phalaResponse = Invoke-WebRequest -Uri "https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network" -Method GET -UseBasicParsing
    Write-Host "✅ Phala Cloud WebUI accessible (Status: $($phalaResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Phala Cloud WebUI may not be accessible: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Start frontend
Write-Host "`nStarting BGIN Multi-Agent Frontend..." -ForegroundColor Blue
Write-Host "   This will start your React app with Phala Cloud integration" -ForegroundColor White

# Change to frontend directory and start
Set-Location frontend

Write-Host "`nInstalling dependencies (if needed)..." -ForegroundColor Yellow
npm install

Write-Host "`nStarting development server..." -ForegroundColor Green
Write-Host "   Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "   Phala Cloud WebUI: https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network" -ForegroundColor White

Write-Host "`nYour BGIN Multi-Agent System Features:" -ForegroundColor Cyan
Write-Host "   • Archive Agent: Knowledge synthesis with Phala Cloud TEE" -ForegroundColor White
Write-Host "   • Codex Agent: Policy analysis with confidential compute" -ForegroundColor White
Write-Host "   • Discourse Agent: Community engagement with privacy protection" -ForegroundColor White
Write-Host "   • Multi-Agent Mode: Coordinated analysis across all agents" -ForegroundColor White
Write-Host "   • Phala Cloud Backend: TEE-verified, privacy-preserving AI" -ForegroundColor White

Write-Host "`nManagement:" -ForegroundColor Cyan
Write-Host "   • Stop: Ctrl+C in this terminal" -ForegroundColor White
Write-Host "   • Restart: Run this script again" -ForegroundColor White
Write-Host "   • Logs: Check terminal output for any errors" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop the development server" -ForegroundColor Yellow

# Start the development server
npm run dev
