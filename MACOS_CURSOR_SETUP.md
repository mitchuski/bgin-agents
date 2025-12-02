# BGIN AI MVP - macOS + Cursor IDE Setup Guide

This guide provides optimized setup instructions for macOS development with Cursor IDE.

## 🍎 **macOS + Cursor IDE Quick Start**

### **Option 1: Automated Setup (Recommended)**
```bash
# Make the script executable
chmod +x setup-macos-cursor.sh

# Run the macOS + Cursor setup script
./setup-macos-cursor.sh
```

### **Option 2: Manual Setup**
Follow the step-by-step instructions below.

## 📋 **Prerequisites**

### **System Requirements**
- **macOS**: 10.15 (Catalina) or later
- **Architecture**: Apple Silicon (M1/M2/M3) or Intel
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space
- **Internet**: Stable connection for downloads

### **Required Software**
- **Xcode Command Line Tools**
- **Homebrew** (package manager)
- **Node.js 18+**
- **Ollama** (local LLM)
- **Cursor IDE** (code editor)

## 🛠️ **Step-by-Step Setup**

### **Step 1: Install Xcode Command Line Tools**
```bash
# Check if already installed
xcode-select -p

# If not installed, install them
xcode-select --install
```

### **Step 2: Install Homebrew**
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH (for Apple Silicon)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# Verify installation
brew --version
```

### **Step 3: Install Node.js**
```bash
# Install Node.js 20 (LTS)
brew install node@20
brew link --force node@20

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

### **Step 4: Install Ollama**
```bash
# Install Ollama
brew install ollama

# Start Ollama service
brew services start ollama

# Download required model
ollama pull llama3.2:3b-instruct-q4_0

# Verify installation
ollama list
```

### **Step 5: Install Cursor IDE**
```bash
# Download and install from https://cursor.sh/
# Or install via Homebrew (if available)
brew install --cask cursor
```

### **Step 6: Clone and Setup Project**
```bash
# Clone the repository
git clone https://github.com/mitchuski/bgin-agents.git
cd bgin-agents

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Create environment file
cp env.example .env
```

### **Step 7: Build the Application**
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Build backend (if TypeScript)
cd backend
npm run build
cd ..
```

### **Step 8: Start the System**
```bash
# Start the server
node simple-server.js

# Or use the macOS start script
./start-bgin-macos.sh
```

## 🎯 **Cursor IDE Configuration**

### **Open Project in Cursor**
```bash
# Open the project in Cursor
cursor .
```

### **Cursor IDE Features**
- **Debug Configuration**: Press F5 to debug the server
- **Task Runner**: Cmd+Shift+P → "Tasks: Run Task"
- **Integrated Terminal**: Built-in terminal with zsh
- **TypeScript Support**: Full IntelliSense and error checking
- **Git Integration**: Built-in Git support

### **Available Tasks in Cursor**
1. **Start BGIN Server** - Start the main server
2. **Start Frontend Dev** - Start frontend development server
3. **Install Dependencies** - Install all dependencies
4. **Test Ollama** - Test Ollama connection

### **Debug Configurations**
- **Debug BGIN Server** - Debug the main server with breakpoints
- **Debug Frontend** - Debug the frontend development server

## 🔧 **macOS-Specific Optimizations**

### **Performance Optimizations**
```bash
# Increase file watcher limits (for large projects)
echo "kern.maxfiles=65536" | sudo tee -a /etc/sysctl.conf
echo "kern.maxfilesperproc=65536" | sudo tee -a /etc/sysctl.conf

# Reload sysctl settings
sudo sysctl -p
```

### **Terminal Configuration**
```bash
# Use zsh as default shell
chsh -s /bin/zsh

# Install Oh My Zsh (optional but recommended)
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### **Homebrew Services**
```bash
# Start services automatically
brew services start ollama

# Check service status
brew services list
```

## 🧪 **Testing the Setup**

### **1. Test Ollama**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test the model
ollama run llama3.2:3b-instruct-q4_0
```

### **2. Test Server**
```bash
# Start server
node simple-server.js

# In another terminal, test endpoints
curl http://localhost:4000/api/status
curl http://localhost:4000/api/test-ollama
```

### **3. Test Frontend**
```bash
# Open browser to
open http://localhost:4000
```

## 🚨 **macOS-Specific Troubleshooting**

### **Common Issues**

#### **Ollama Not Starting**
```bash
# Check if Ollama is installed
brew list | grep ollama

# Start Ollama manually
ollama serve

# Check if port 11434 is available
lsof -i :11434
```

#### **Node.js Version Issues**
```bash
# Check current version
node --version

# Install specific version
brew install node@20
brew link --force node@20

# Use nvm (alternative)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### **Permission Issues**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix Homebrew permissions
sudo chown -R $(whoami) /opt/homebrew
```

#### **Port Conflicts**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use the provided script
./start-bgin-macos.sh
```

#### **Cursor IDE Issues**
```bash
# Reset Cursor settings
rm -rf ~/Library/Application\ Support/Cursor

# Clear Cursor cache
rm -rf ~/Library/Caches/Cursor

# Restart Cursor
killall Cursor
open -a Cursor
```

### **Apple Silicon Specific Issues**

#### **Architecture Mismatch**
```bash
# Check architecture
uname -m

# Install Rosetta 2 (if needed)
softwareupdate --install-rosetta

# Use specific architecture
arch -arm64 brew install ollama
arch -x86_64 brew install ollama
```

#### **Performance Issues**
```bash
# Check Activity Monitor for high CPU usage
# Consider using native ARM64 versions of tools
brew install --cask cursor  # If available
```

## 📱 **macOS Integration Features**

### **Spotlight Integration**
```bash
# Add project to Spotlight (optional)
mdutil -i on /
```

### **Dock Integration**
```bash
# Pin Cursor to Dock
# Right-click Cursor in Dock → Options → Keep in Dock
```

### **Notification Center**
- Server status notifications
- Build completion notifications
- Error notifications

## 🎯 **Block 13 Conference Features**

### **Pre-configured for macOS**
- **19 Conference Sessions** across 5 working groups
- **Multi Agent Hub** for collaborative discussions
- **Track-based Organization**: BGIN Agent Hack, IKP, Cyber Security, FASE, General
- **Discourse Integration** for publishing insights
- **macOS-optimized performance**

### **macOS-Specific Features**
- **Native file system integration**
- **Optimized for Apple Silicon**
- **Cursor IDE debugging support**
- **Terminal integration**
- **Spotlight search support**

## 🚀 **Quick Start Commands**

### **Daily Development**
```bash
# Start development
./start-bgin-macos.sh

# Open in Cursor
cursor .

# Debug server
# Press F5 in Cursor

# Run tasks
# Cmd+Shift+P → Tasks: Run Task
```

### **Testing**
```bash
# Test Ollama
curl http://localhost:11434/api/tags

# Test server
curl http://localhost:4000/api/status

# Test frontend
open http://localhost:4000
```

### **Maintenance**
```bash
# Update dependencies
npm update

# Update Ollama models
ollama pull llama3.2:3b-instruct-q4_0

# Clean build
rm -rf frontend/dist backend/dist
npm run build
```

## 📞 **Getting Help**

### **macOS-Specific Support**
- **Apple Developer Forums**: https://developer.apple.com/forums/
- **Homebrew Community**: https://github.com/Homebrew/discussions
- **Node.js macOS Guide**: https://nodejs.org/en/download/package-manager/#macos

### **Cursor IDE Support**
- **Cursor Documentation**: https://cursor.sh/docs
- **Cursor GitHub**: https://github.com/getcursor/cursor
- **Cursor Discord**: https://discord.gg/cursor

### **BGIN AI MVP Support**
- **GitHub Issues**: https://github.com/mitchuski/bgin-agents/issues
- **BGIN Community**: https://bgin.discourse.group/

---

**🍎 Ready for macOS development with Cursor IDE!**

*This setup provides an optimized development environment for macOS with full Cursor IDE integration, perfect for the Block 13 hackathon.*
