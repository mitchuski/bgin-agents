#!/bin/bash

# BGIN AI MVP - Block 13 Hackathon Setup Script
# This script ensures all dependencies are installed and the system is ready to run

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        lsof -i :$1 >/dev/null 2>&1
    else
        # Linux
        lsof -i :$1 >/dev/null 2>&1
    fi
}

print_header "BGIN AI MVP - Block 13 Hackathon Setup"
echo "This script will set up the complete BGIN AI MVP system for the hackathon"
echo ""

# Check if we're on macOS and suggest Cursor-specific setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "macOS detected! For optimal Cursor IDE experience, consider using:"
    print_status "  ./setup-macos-cursor.sh"
    echo ""
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "simple-server.js" ]; then
    print_error "Please run this script from the bgin-ai-mvp directory"
    exit 1
fi

print_header "1. System Requirements Check"

# Check Node.js
print_status "Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
        print_status "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
print_status "Checking npm..."
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

# Check Git
print_status "Checking Git..."
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git found: $GIT_VERSION"
else
    print_error "Git not found. Please install Git"
    exit 1
fi

print_header "2. Ollama Installation Check"

# Check if Ollama is installed
if command_exists ollama; then
    print_success "Ollama found"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        print_success "Ollama is running"
    else
        print_warning "Ollama is installed but not running. Starting Ollama..."
        ollama serve &
        sleep 5
        
        # Check again
        if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            print_success "Ollama started successfully"
        else
            print_error "Failed to start Ollama. Please start it manually: ollama serve"
        fi
    fi
    
    # Check if required model is installed
    print_status "Checking for required model..."
    if ollama list | grep -q "llama3.2:3b-instruct-q4_0"; then
        print_success "Required model found: llama3.2:3b-instruct-q4_0"
    else
        print_warning "Required model not found. Downloading llama3.2:3b-instruct-q4_0..."
        ollama pull llama3.2:3b-instruct-q4_0
        print_success "Model downloaded successfully"
    fi
else
    print_warning "Ollama not found. Installing Ollama..."
    
    # Detect OS and install Ollama
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://ollama.ai/install.sh | sh
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - Try multiple installation methods
        if command_exists brew; then
            print_status "Installing Ollama via Homebrew..."
            brew install ollama
        elif command_exists curl; then
            print_status "Installing Ollama via direct download..."
            curl -fsSL https://ollama.ai/install.sh | sh
        else
            print_error "Neither Homebrew nor curl found. Please install Ollama manually from https://ollama.ai/"
            print_status "Or install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    else
        print_error "Unsupported OS. Please install Ollama manually from https://ollama.ai/"
        exit 1
    fi
    
    # Start Ollama
    print_status "Starting Ollama..."
    ollama serve &
    sleep 5
    
    # Download required model
    print_status "Downloading required model..."
    ollama pull llama3.2:3b-instruct-q4_0
    print_success "Ollama setup complete"
fi

print_header "3. Dependencies Installation"

# Install root dependencies
print_status "Installing root dependencies..."
npm install
print_success "Root dependencies installed"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
print_success "Frontend dependencies installed"
cd ..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed"
cd ..

print_header "4. Environment Configuration"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cp env.example .env
    print_success ".env file created from template"
    print_warning "Please review and update .env file with your configuration"
else
    print_success ".env file already exists"
fi

print_header "5. Build Process"

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
print_success "Frontend built successfully"
cd ..

# Build backend (if TypeScript)
if [ -f "backend/tsconfig.json" ]; then
    print_status "Building backend..."
    cd backend
    npm run build
    print_success "Backend built successfully"
    cd ..
fi

print_header "6. Port Availability Check"

# Check if ports are available
if port_in_use 4000; then
    print_warning "Port 4000 is in use. The server may already be running."
    print_status "If you need to stop it, run: pkill -f 'node simple-server.js'"
else
    print_success "Port 4000 is available"
fi

print_header "7. System Health Check"

# Test Ollama connection
print_status "Testing Ollama connection..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    print_success "Ollama is responding"
else
    print_error "Ollama is not responding. Please check if it's running."
fi

# Test if we can start the server briefly
print_status "Testing server startup..."
timeout 10s node simple-server.js >/dev/null 2>&1 &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server can start successfully"
    kill $SERVER_PID 2>/dev/null || true
else
    print_error "Server failed to start. Please check the logs."
fi

print_header "8. Quick Start Commands"

echo ""
print_success "Setup complete! Here are the quick start commands:"
echo ""
echo -e "${CYAN}Start the server:${NC}"
echo "  npm run dev:simple"
echo ""
echo -e "${CYAN}Or start manually:${NC}"
echo "  node simple-server.js"
echo ""
echo -e "${CYAN}Access the application:${NC}"
echo "  Frontend: http://localhost:4000"
echo "  API: http://localhost:4000/api"
echo "  Health: http://localhost:4000/health"
echo ""
echo -e "${CYAN}Test the system:${NC}"
echo "  curl http://localhost:4000/api/status"
echo "  curl http://localhost:4000/api/test-ollama"
echo ""

print_header "9. Block 13 Conference Sessions"

echo ""
print_success "Conference sessions are pre-configured:"
echo "  - 19 Block 13 sessions across 5 working groups"
echo "  - Multi Agent Hub for collaborative discussions"
echo "  - Track-based organization (BGIN Agent Hack, IKP, Cyber Security, FASE, General)"
echo "  - Discourse integration for publishing insights"
echo ""

print_header "10. Troubleshooting"

echo ""
print_warning "If you encounter issues:"
echo "  1. Check that Ollama is running: ollama serve"
echo "  2. Check that the required model is installed: ollama list"
echo "  3. Check port availability: lsof -i :4000"
echo "  4. Check logs for errors"
echo "  5. Restart the server: pkill -f 'node simple-server.js' && node simple-server.js"
echo ""

print_success "BGIN AI MVP is ready for the Block 13 Hackathon! 🚀"
echo ""
echo -e "${PURPLE}Happy coding and good luck with the hackathon!${NC}"
