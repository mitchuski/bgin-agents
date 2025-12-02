# BGIN AI MVP - Block 13 Hackathon Setup Guide

This guide ensures your BGIN AI MVP system is ready for the Block 13 hackathon on any machine.

## 🚀 **Quick Start (Automated Setup)**

### **For macOS + Cursor IDE (Recommended):**
```bash
# Make the script executable
chmod +x setup-macos-cursor.sh

# Run the macOS + Cursor setup script
./setup-macos-cursor.sh
```

### **For Linux/macOS (General):**
```bash
# Make the script executable
chmod +x setup-hackathon.sh

# Run the setup script
./setup-hackathon.sh
```

### **For Windows:**
```powershell
# Run the PowerShell setup script
.\setup-hackathon.ps1

# Or skip Ollama installation if already installed
.\setup-hackathon.ps1 -SkipOllama
```

## 📋 **What the Setup Scripts Do**

### **1. System Requirements Check**
- ✅ Node.js 18+ verification
- ✅ npm verification  
- ✅ Git verification
- ✅ Port availability check

### **2. Ollama Installation & Configuration**
- ✅ Install Ollama (if not present)
- ✅ Start Ollama service
- ✅ Download required model: `llama3.2:3b-instruct-q4_0`
- ✅ Verify Ollama is responding

### **3. Dependencies Installation**
- ✅ Install root dependencies (`npm install`)
- ✅ Install frontend dependencies (`cd frontend && npm install`)
- ✅ Install backend dependencies (`cd backend && npm install`)

### **4. Environment Configuration**
- ✅ Create `.env` file from template
- ✅ Set up environment variables

### **5. Build Process**
- ✅ Build frontend (`npm run build`)
- ✅ Build backend (if TypeScript)

### **6. System Health Check**
- ✅ Test Ollama connection
- ✅ Test server startup
- ✅ Verify all components working

## 🛠️ **Manual Setup (If Scripts Fail)**

### **Prerequisites**
```bash
# Install Node.js 18+ from https://nodejs.org/
# Install Git from https://git-scm.com/
# Install Ollama from https://ollama.ai/
```

### **Step 1: Install Ollama**
```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# macOS (with Homebrew)
brew install ollama

# Windows
# Download from https://ollama.ai/ and install
```

### **Step 2: Start Ollama & Download Model**
```bash
# Start Ollama
ollama serve

# Download required model
ollama pull llama3.2:3b-instruct-q4_0
```

### **Step 3: Install Dependencies**
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..

# Backend dependencies
cd backend
npm install
cd ..
```

### **Step 4: Build Application**
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

### **Step 5: Configure Environment**
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

### **Step 6: Start the System**
```bash
# Start the server
npm run dev:simple

# Or start manually
node simple-server.js
```

## 🔧 **Environment Variables**

### **Required Variables**
```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b-instruct-q4_0

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-here
```

### **Optional Variables**
```bash
# OpenAI Integration (optional)
OPENAI_API_KEY=your-openai-api-key-here

# Phala Cloud Integration (optional)
PHALA_CLOUD_URL=your-phala-cloud-url
PHALA_CLOUD_API_KEY=your-phala-cloud-api-key

# Discourse Integration (optional)
DISCOURSE_URL=https://bgin.discourse.group
DISCOURSE_API_KEY=your-discourse-api-key
DISCOURSE_USERNAME=your-discourse-username
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
http://localhost:4000
```

## 🎯 **Block 13 Conference Features**

### **Pre-configured Sessions**
- **19 Conference Sessions** across 5 working groups
- **Multi Agent Hub** for collaborative discussions
- **Track-based Organization**: BGIN Agent Hack, IKP, Cyber Security, FASE, General
- **Discourse Integration** for publishing insights

### **Available Tracks**
1. **BGIN Agent Hack** - Multi-agent system development
2. **IKP** - Identity, Key Management & Privacy
3. **Cyber Security** - Blockchain security and threat analysis
4. **FASE** - Financial and Social Economies
5. **General** - General discussions and networking

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Ollama Not Starting**
```bash
# Check if Ollama is installed
ollama --version

# Start Ollama manually
ollama serve

# Check if port 11434 is available
lsof -i :11434  # Linux/macOS
netstat -an | findstr :11434  # Windows
```

#### **Model Not Found**
```bash
# List installed models
ollama list

# Download required model
ollama pull llama3.2:3b-instruct-q4_0

# Check model is working
ollama run llama3.2:3b-instruct-q4_0
```

#### **Port 4000 in Use**
```bash
# Find process using port 4000
lsof -i :4000  # Linux/macOS
netstat -ano | findstr :4000  # Windows

# Kill the process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

#### **Dependencies Installation Failed**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

#### **Build Failures**
```bash
# Check Node.js version
node --version  # Should be 18+

# Update npm
npm install -g npm@latest

# Clear build cache
rm -rf frontend/dist
rm -rf backend/dist

# Rebuild
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..
```

### **System Requirements**

#### **Minimum Requirements**
- **OS**: Windows 10, macOS 10.15, Ubuntu 18.04+
- **Node.js**: 18.0.0+
- **npm**: 9.0.0+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for initial setup

#### **Recommended Requirements**
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **Node.js**: 20.0.0+
- **npm**: 10.0.0+
- **RAM**: 8GB+
- **Storage**: 5GB+ free space
- **Network**: Stable internet connection

## 📞 **Getting Help**

### **Quick Help Commands**
```bash
# Check system status
curl http://localhost:4000/api/status

# Test Ollama integration
curl http://localhost:4000/api/test-ollama

# Check conference sessions
curl http://localhost:4000/api/conference/sessions

# Test chat functionality
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, test message","agent":"archive","sessionId":"test"}'
```

### **Support Resources**
- **GitHub Issues**: [Create an issue](https://github.com/mitchuski/bgin-agents/issues)
- **BGIN Community**: [Join discussions](https://bgin.discourse.group/)
- **Documentation**: Check the `/docs` folder
- **Setup Logs**: Check console output for error messages

## 🎉 **Success Indicators**

### **Setup Complete When:**
- ✅ Ollama is running and responding
- ✅ Required model is installed
- ✅ All dependencies are installed
- ✅ Frontend and backend are built
- ✅ Server starts without errors
- ✅ Frontend loads at http://localhost:4000
- ✅ API endpoints respond correctly
- ✅ Conference sessions are available

### **Ready for Hackathon When:**
- ✅ All tests pass
- ✅ Multi-agent system is working
- ✅ Conference sessions are accessible
- ✅ Discourse integration is configured (optional)
- ✅ Team can access and use the system

---

**🚀 You're ready for the Block 13 Hackathon!**

*This setup ensures your BGIN AI MVP system is fully functional and ready for collaborative blockchain governance research and development.*
