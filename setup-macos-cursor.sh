#!/bin/bash

# BGIN AI MVP - macOS + Cursor IDE Setup Script
# Optimized for macOS development with Cursor IDE

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

# Function to check if port is in use (macOS optimized)
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

print_header "BGIN AI MVP - macOS + Cursor IDE Setup"
echo "This script sets up BGIN AI MVP for macOS development with Cursor IDE"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS. Use setup-hackathon.sh for Linux."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "simple-server.js" ]; then
    print_error "Please run this script from the bgin-ai-mvp directory"
    exit 1
fi

print_header "1. macOS System Check"

# Check macOS version
MACOS_VERSION=$(sw_vers -productVersion)
print_status "macOS version: $MACOS_VERSION"

# Check if we're on Apple Silicon or Intel
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    print_success "Apple Silicon (M1/M2/M3) detected - optimized for ARM64"
    ARCH_TYPE="arm64"
else
    print_success "Intel Mac detected - using x86_64"
    ARCH_TYPE="x86_64"
fi

print_header "2. Development Tools Check"

# Check Xcode Command Line Tools
print_status "Checking Xcode Command Line Tools..."
if xcode-select -p >/dev/null 2>&1; then
    print_success "Xcode Command Line Tools found"
else
    print_warning "Xcode Command Line Tools not found. Installing..."
    xcode-select --install
    print_warning "Please complete the Xcode Command Line Tools installation and run this script again"
    exit 1
fi

# Check Homebrew
print_status "Checking Homebrew..."
if command_exists brew; then
    BREW_VERSION=$(brew --version | head -n1)
    print_success "Homebrew found: $BREW_VERSION"
    
    # Update Homebrew
    print_status "Updating Homebrew..."
    brew update >/dev/null 2>&1 || true
else
    print_warning "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon
    if [[ "$ARCH" == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

print_header "3. Node.js Installation (macOS Optimized)"

# Check Node.js
print_status "Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_warning "Node.js version 18 or higher recommended. Current version: $NODE_VERSION"
        print_status "Updating Node.js via Homebrew..."
        brew install node@20
        brew link --force node@20
    fi
else
    print_status "Installing Node.js via Homebrew..."
    brew install node@20
    brew link --force node@20
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js: $NODE_VERSION, npm: $NPM_VERSION"

print_header "4. Ollama Installation (macOS Optimized)"

# Check if Ollama is installed
if command_exists ollama; then
    print_success "Ollama found"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        print_success "Ollama is running"
    else
        print_warning "Ollama is installed but not running. Starting Ollama..."
        # Start Ollama in background
        nohup ollama serve > /dev/null 2>&1 &
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
        print_status "This may take a few minutes depending on your internet connection..."
        ollama pull llama3.2:3b-instruct-q4_0
        print_success "Model downloaded successfully"
    fi
else
    print_status "Installing Ollama via Homebrew..."
    brew install ollama
    
    # Start Ollama
    print_status "Starting Ollama..."
    nohup ollama serve > /dev/null 2>&1 &
    sleep 5
    
    # Download required model
    print_status "Downloading required model..."
    print_status "This may take a few minutes depending on your internet connection..."
    ollama pull llama3.2:3b-instruct-q4_0
    print_success "Ollama setup complete"
fi

print_header "5. Cursor IDE Compatibility Setup"

# Check if Cursor is installed
if [ -d "/Applications/Cursor.app" ]; then
    print_success "Cursor IDE found"
else
    print_warning "Cursor IDE not found. Please install from https://cursor.sh/"
    print_status "After installing Cursor, you can open this project with:"
    print_status "  cursor ."
fi

# Create Cursor-specific configuration
print_status "Setting up Cursor IDE configuration..."

# Create .vscode directory for Cursor compatibility
mkdir -p .vscode

# Create launch.json for debugging
cat > .vscode/launch.json << 'EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug BGIN Server",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/simple-server.js",
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development"
            },
            "skipFiles": ["<node_internals>/**"]
        },
        {
            "name": "Debug Frontend",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/frontend/node_modules/vite/bin/vite.js",
            "args": ["--config", "vite.config.ts"],
            "cwd": "${workspaceFolder}/frontend",
            "console": "integratedTerminal"
        }
    ]
}
EOF

# Create tasks.json for common tasks
cat > .vscode/tasks.json << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Start BGIN Server",
            "type": "shell",
            "command": "node",
            "args": ["simple-server.js"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "problemMatcher": []
        },
        {
            "label": "Start Frontend Dev",
            "type": "shell",
            "command": "npm",
            "args": ["run", "dev"],
            "options": {
                "cwd": "${workspaceFolder}/frontend"
            },
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "problemMatcher": []
        },
        {
            "label": "Install Dependencies",
            "type": "shell",
            "command": "npm",
            "args": ["install"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "problemMatcher": []
        },
        {
            "label": "Test Ollama",
            "type": "shell",
            "command": "curl",
            "args": ["http://localhost:11434/api/tags"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "problemMatcher": []
        }
    ]
}
EOF

# Create settings.json for Cursor
cat > .vscode/settings.json << 'EOF'
{
    "typescript.preferences.importModuleSpecifier": "relative",
    "typescript.suggest.autoImports": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "files.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "**/.git": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "**/chat-storage": true
    },
    "terminal.integrated.defaultProfile.osx": "zsh",
    "terminal.integrated.profiles.osx": {
        "zsh": {
            "path": "/bin/zsh",
            "args": ["-l"]
        }
    }
}
EOF

print_success "Cursor IDE configuration created"

print_header "6. Dependencies Installation"

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

print_header "7. Environment Configuration"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cp env.example .env
    print_success ".env file created from template"
    print_warning "Please review and update .env file with your configuration"
else
    print_success ".env file already exists"
fi

print_header "8. Build Process"

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

print_header "9. macOS-Specific Optimizations"

# Set up proper file permissions
print_status "Setting up file permissions..."
chmod +x setup-hackathon.sh
chmod +x setup-macos-cursor.sh

# Create a macOS-specific start script
cat > start-bgin-macos.sh << 'EOF'
#!/bin/bash

# BGIN AI MVP - macOS Start Script
echo "🚀 Starting BGIN AI MVP on macOS..."

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "⚠️  Starting Ollama..."
    nohup ollama serve > /dev/null 2>&1 &
    sleep 3
fi

# Start the server
echo "🌐 Starting BGIN AI MVP Server..."
node simple-server.js
EOF

chmod +x start-bgin-macos.sh
print_success "macOS start script created"

print_header "10. System Health Check"

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

print_header "11. Cursor IDE Integration"

print_success "Cursor IDE is ready! Here's how to use it:"
echo ""
echo -e "${CYAN}Open in Cursor:${NC}"
echo "  cursor ."
echo ""
echo -e "${CYAN}Debug the server:${NC}"
echo "  Press F5 or use the Debug panel"
echo ""
echo -e "${CYAN}Run tasks:${NC}"
echo "  Cmd+Shift+P -> Tasks: Run Task"
echo "  - Start BGIN Server"
echo "  - Start Frontend Dev"
echo "  - Test Ollama"
echo ""

print_header "12. Quick Start Commands"

echo ""
print_success "Setup complete! Here are the quick start commands:"
echo ""
echo -e "${CYAN}Start the server:${NC}"
echo "  ./start-bgin-macos.sh"
echo "  # or"
echo "  npm run dev:simple"
echo ""
echo -e "${CYAN}Open in Cursor:${NC}"
echo "  cursor ."
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

print_header "13. Block 13 Conference Sessions"

echo ""
print_success "Conference sessions are pre-configured:"
echo "  - 19 Block 13 sessions across 5 working groups"
echo "  - Multi Agent Hub for collaborative discussions"
echo "  - Track-based organization (BGIN Agent Hack, IKP, Cyber Security, FASE, General)"
echo "  - Discourse integration for publishing insights"
echo ""

print_header "14. macOS-Specific Troubleshooting"

echo ""
print_warning "macOS-specific troubleshooting:"
echo "  1. If Ollama fails to start: brew services start ollama"
echo "  2. If port 4000 is in use: lsof -ti:4000 | xargs kill -9"
echo "  3. If Homebrew issues: brew doctor"
echo "  4. If Node.js issues: brew reinstall node@20"
echo "  5. If Cursor issues: Restart Cursor and reload window"
echo ""

print_success "BGIN AI MVP is ready for macOS development with Cursor IDE! 🚀"
echo ""
echo -e "${PURPLE}Happy coding on macOS! 🍎${NC}"
