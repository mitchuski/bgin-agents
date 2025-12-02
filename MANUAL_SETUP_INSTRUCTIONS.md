# Kyra AI Agent - Manual Setup Instructions

## 🚀 Quick Setup Guide

Since the automated script requires administrator privileges, here's how to set up your project manually:

### Step 1: Install Required Software

#### Option A: Download and Install Manually
1. **Git**: Download from https://git-scm.com/download/win
2. **Node.js**: Download from https://nodejs.org/ (choose LTS version 18.x or 20.x)
3. **Docker Desktop**: Download from https://www.docker.com/products/docker-desktop/
4. **VS Code**: Download from https://code.visualstudio.com/ (optional but recommended)

#### Option B: Use Windows Package Manager (if available)
```powershell
# Open PowerShell as Administrator and run:
winget install Git.Git
winget install OpenJS.NodeJS
winget install Docker.DockerDesktop
winget install Microsoft.VisualStudioCode
```

### Step 2: Verify Installations
Open a new PowerShell window and run:
```powershell
git --version
node --version
npm --version
docker --version
```

### Step 3: Set Up Project
```powershell
# Navigate to your project directory
cd bgin-ai-mvp

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 4: Start Development Environment
```powershell
# Start database services
docker-compose up -d postgres redis

# Wait 30 seconds for services to initialize
Start-Sleep -Seconds 30

# Start development servers
npm run dev
```

### Step 5: Access Your Application
- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🔧 Troubleshooting

### If Git is not recognized:
- Restart your computer after installing Git
- Or add Git to your PATH manually

### If Node.js is not recognized:
- Restart your computer after installing Node.js
- Or add Node.js to your PATH manually

### If Docker is not working:
- Start Docker Desktop application
- Wait for it to fully load before running docker commands

### If ports are in use:
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## 📁 Project Structure Created

Your project now has this structure:
```
bgin-ai-mvp/
├── package.json              # Root package configuration
├── docker-compose.yml        # Docker services configuration
├── env.example              # Environment variables template
├── README.md                # Project documentation
├── frontend/                # React TypeScript application
│   ├── package.json
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js Express API
│   ├── package.json
│   ├── src/
│   │   ├── agents/         # Multi-agent system
│   │   ├── knowledge/      # Knowledge management
│   │   ├── privacy/        # Privacy controls
│   │   ├── trust/          # Trust network
│   │   ├── integrations/   # External services
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   └── utils/          # Utility functions
│   └── tests/              # Test files
├── infrastructure/          # Deployment configs
├── database/               # Database files
├── docs/                   # Documentation
├── scripts/                # Automation scripts
└── config/                 # Configuration files
```

## 🎯 Next Steps

1. **Install the required software** (Git, Node.js, Docker)
2. **Run the setup commands** above
3. **Start developing** your Kyra AI Agent!
4. **Follow the Complete Setup Guide** for detailed instructions
5. **Check the Deployment Roadmap** for production deployment

## 📚 Additional Resources

- **Complete Setup Guide**: `..\COMPLETE_SETUP_GUIDE.md`
- **Quick Start Checklist**: `..\QUICK_START_CHECKLIST.md`
- **Deployment Roadmap**: `..\DEPLOYMENT_ROADMAP.md`

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the Complete Setup Guide
3. Make sure all software is properly installed
4. Restart your computer if needed

---

**You're ready to build the future of AI governance! 🚀**
