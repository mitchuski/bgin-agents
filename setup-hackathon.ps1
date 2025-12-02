# BGIN AI MVP - Block 13 Hackathon Setup Script (Windows PowerShell)
# This script ensures all dependencies are installed and the system is ready to run

param(
    [switch]$SkipOllama,
    [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Cyan"
    Purple = "Magenta"
    Cyan = "Cyan"
}

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

function Write-Header {
    param([string]$Message)
    Write-Host "=================================" -ForegroundColor $Colors.Purple
    Write-Host $Message -ForegroundColor $Colors.Purple
    Write-Host "=================================" -ForegroundColor $Colors.Purple
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

Write-Header "BGIN AI MVP - Block 13 Hackathon Setup"
Write-Host "This script will set up the complete BGIN AI MVP system for the hackathon"
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "simple-server.js")) {
    Write-Error "Please run this script from the bgin-ai-mvp directory"
    exit 1
}

Write-Header "1. System Requirements Check"

# Check Node.js
Write-Status "Checking Node.js..."
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
    
    # Check if version is 18 or higher
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 18) {
        Write-Error "Node.js version 18 or higher is required. Current version: $nodeVersion"
        Write-Status "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    }
} else {
    Write-Error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}

# Check npm
Write-Status "Checking npm..."
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Success "npm found: $npmVersion"
} else {
    Write-Error "npm not found. Please install npm"
    exit 1
}

# Check Git
Write-Status "Checking Git..."
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
} else {
    Write-Error "Git not found. Please install Git"
    exit 1
}

Write-Header "2. Ollama Installation Check"

if (-not $SkipOllama) {
    # Check if Ollama is installed
    if (Test-Command "ollama") {
        Write-Success "Ollama found"
        
        # Check if Ollama is running
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5
            Write-Success "Ollama is running"
        }
        catch {
            Write-Warning "Ollama is installed but not running. Starting Ollama..."
            Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
            Start-Sleep -Seconds 5
            
            # Check again
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5
                Write-Success "Ollama started successfully"
            }
            catch {
                Write-Error "Failed to start Ollama. Please start it manually: ollama serve"
            }
        }
        
        # Check if required model is installed
        Write-Status "Checking for required model..."
        $modelList = ollama list
        if ($modelList -match "llama3.2:3b-instruct-q4_0") {
            Write-Success "Required model found: llama3.2:3b-instruct-q4_0"
        } else {
            Write-Warning "Required model not found. Downloading llama3.2:3b-instruct-q4_0..."
            ollama pull llama3.2:3b-instruct-q4_0
            Write-Success "Model downloaded successfully"
        }
    } else {
        Write-Warning "Ollama not found. Please install Ollama from https://ollama.ai/"
        Write-Status "After installing Ollama, run this script again with -SkipOllama to continue"
        Write-Status "Or install Ollama manually and run: ollama pull llama3.2:3b-instruct-q4_0"
    }
} else {
    Write-Status "Skipping Ollama installation check"
}

Write-Header "3. Dependencies Installation"

# Install root dependencies
Write-Status "Installing root dependencies..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Root dependencies installed"
} else {
    Write-Error "Failed to install root dependencies"
    exit 1
}

# Install frontend dependencies
Write-Status "Installing frontend dependencies..."
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Frontend dependencies installed"
} else {
    Write-Error "Failed to install frontend dependencies"
    exit 1
}
Set-Location ..

# Install backend dependencies
Write-Status "Installing backend dependencies..."
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Backend dependencies installed"
} else {
    Write-Error "Failed to install backend dependencies"
    exit 1
}
Set-Location ..

Write-Header "4. Environment Configuration"

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Status "Creating .env file..."
    Copy-Item "env.example" ".env"
    Write-Success ".env file created from template"
    Write-Warning "Please review and update .env file with your configuration"
} else {
    Write-Success ".env file already exists"
}

Write-Header "5. Build Process"

# Build frontend
Write-Status "Building frontend..."
Set-Location frontend
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Frontend built successfully"
} else {
    Write-Error "Failed to build frontend"
    exit 1
}
Set-Location ..

# Build backend (if TypeScript)
if (Test-Path "backend/tsconfig.json") {
    Write-Status "Building backend..."
    Set-Location backend
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend built successfully"
    } else {
        Write-Error "Failed to build backend"
        exit 1
    }
    Set-Location ..
}

Write-Header "6. Port Availability Check"

# Check if ports are available
if (Test-Port 4000) {
    Write-Warning "Port 4000 is in use. The server may already be running."
    Write-Status "If you need to stop it, run: Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process"
} else {
    Write-Success "Port 4000 is available"
}

Write-Header "7. System Health Check"

# Test Ollama connection
if (-not $SkipOllama) {
    Write-Status "Testing Ollama connection..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5
        Write-Success "Ollama is responding"
    }
    catch {
        Write-Error "Ollama is not responding. Please check if it's running."
    }
}

# Test if we can start the server briefly
Write-Status "Testing server startup..."
$serverProcess = Start-Process -FilePath "node" -ArgumentList "simple-server.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

if (-not $serverProcess.HasExited) {
    Write-Success "Server can start successfully"
    Stop-Process -Id $serverProcess.Id -Force
} else {
    Write-Error "Server failed to start. Please check the logs."
}

Write-Header "8. Quick Start Commands"

Write-Host ""
Write-Success "Setup complete! Here are the quick start commands:"
Write-Host ""
Write-Host "Start the server:" -ForegroundColor $Colors.Cyan
Write-Host "  npm run dev:simple"
Write-Host ""
Write-Host "Or start manually:" -ForegroundColor $Colors.Cyan
Write-Host "  node simple-server.js"
Write-Host ""
Write-Host "Access the application:" -ForegroundColor $Colors.Cyan
Write-Host "  Frontend: http://localhost:4000"
Write-Host "  API: http://localhost:4000/api"
Write-Host "  Health: http://localhost:4000/health"
Write-Host ""
Write-Host "Test the system:" -ForegroundColor $Colors.Cyan
Write-Host "  Invoke-WebRequest -Uri 'http://localhost:4000/api/status' -UseBasicParsing"
Write-Host "  Invoke-WebRequest -Uri 'http://localhost:4000/api/test-ollama' -UseBasicParsing"
Write-Host ""

Write-Header "9. Block 13 Conference Sessions"

Write-Host ""
Write-Success "Conference sessions are pre-configured:"
Write-Host "  - 19 Block 13 sessions across 5 working groups"
Write-Host "  - Multi Agent Hub for collaborative discussions"
Write-Host "  - Track-based organization (BGIN Agent Hack, IKP, Cyber Security, FASE, General)"
Write-Host "  - Discourse integration for publishing insights"
Write-Host ""

Write-Header "10. Troubleshooting"

Write-Host ""
Write-Warning "If you encounter issues:"
Write-Host "  1. Check that Ollama is running: ollama serve"
Write-Host "  2. Check that the required model is installed: ollama list"
Write-Host "  3. Check port availability: Get-NetTCPConnection -LocalPort 4000"
Write-Host "  4. Check logs for errors"
Write-Host "  5. Restart the server: Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process; node simple-server.js"
Write-Host ""

Write-Success "BGIN AI MVP is ready for the Block 13 Hackathon! 🚀"
Write-Host ""
Write-Host "Happy coding and good luck with the hackathon!" -ForegroundColor $Colors.Purple
