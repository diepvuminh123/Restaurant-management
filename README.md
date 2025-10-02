# 🍽️ Restaurant Management System

A comprehensive restaurant management application built with React frontend and Node.js backend. This system helps restaurants manage their menu, orders, and table reservations efficiently.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [Team Collaboration](#-team-collaboration)
- [Features](#-features)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

## 🎯 Project Overview

The Restaurant Management System is designed to streamline restaurant operations with the following core functionalities:

- **Menu Management**: Add, edit, and organize menu items with categories and pricing
- **Order Management**: Track customer orders from placement to completion
- **Table Management**: Manage table reservations and availability
- **Staff Dashboard**: Interface for restaurant staff to manage daily operations
## 📑 Project Report
Overleaf: https://www.overleaf.com/project/68da9495edff44645da00e49
## 🛠 Technology Stack

### Frontend
- **React** 18.2.0 - User interface library
- **React Scripts** 5.0.1 - Build tools and development server
- **CSS3** - Styling with modern responsive design
- **Web Vitals** - Performance monitoring

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** 4.19.2 - Web framework
- **Nodemon** 3.1.0 - Development auto-restart tool

### Deployment
- **Vercel** - Frontend hosting and deployment
- **Git** - Version control

## 📁 Project Structure

```
Restaurant-management/
├── 📁 backend/                    # Backend API server
│   ├── 📁 src/
│   │   └── app.js                 # Express server entry point
│   ├── package.json               # Backend dependencies
│   └── README.md                  # Backend documentation
│
├── 📁 frontend/                   # React frontend application
│   ├── 📁 build/                  # Production build files
│   ├── 📁 public/                 # Static assets
│   │   ├── index.html             # HTML template
│   │   ├── favicon.ico            # App icon
│   │   └── manifest.json          # PWA manifest
│   ├── 📁 src/                    # Source code
│   │   ├── App.js                 # Main React component
│   │   ├── App.css                # Main styling
│   │   ├── index.js               # React entry point
│   │   └── ...                    # Other components
│   ├── 📁 .vercel/                # Vercel deployment config
│   ├── package.json               # Frontend dependencies
│   └── README.md                  # Frontend documentation
│
├── 📁 notes/                      # Project documentation
│   ├── backend-notes.md           # Backend development notes
│   ├── frontend-notes.md          # Frontend development notes
│   └── ideas.md                   # Feature ideas and planning
│
├── package.json                   # Root project configuration
├── README.md                      # This file
└── .gitignore                     # Git ignore rules
```

## ✅ Prerequisites

Before setting up the project, ensure you have the following installed:

1. **Node.js** (version 16.0 or higher)
   ```bash
   # Check your Node.js version
   node --version
   ```

2. **npm** (comes with Node.js)
   ```bash
   # Check your npm version
   npm --version
   ```

3. **Git** (for version control)
   ```bash
   # Check your Git version
   git --version
   ```

4. **Vercel CLI** (for deployment)
   ```bash
   # Install Vercel CLI globally
   npm install -g vercel
   ```

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/diepvuminh123/Restaurant-management.git

# Navigate to project directory
cd Restaurant-management
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Verify installation
npm list
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install frontend dependencies
npm install

# Verify installation
npm list
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
# From project root, navigate to backend
cd backend

# Start development server with auto-restart
npm run dev

# Or start without auto-restart
npm start
```
- Backend will run on: `http://localhost:5000`
- API endpoints will be available at: `http://localhost:5000/api`

#### Start Frontend Application
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Start React development server
npm start
```
- Frontend will run on: `http://localhost:3000`
- Browser will automatically open the application

### Production Build

#### Build Frontend for Production
```bash
# Navigate to frontend directory
cd frontend

# Create production build
npm run build

# Test production build locally
npx serve -s build
```

## 🌐 Deployment

### Frontend Deployment (Vercel)

The frontend is automatically deployed to Vercel with GitHub integration.

**Important**: Project name is `restaurant-management-test` (not `restaurant-management`)

#### Auto-Deployment Setup ✅
- **GitHub Integration**: Connected to repository
- **Project Name**: `restaurant-management-test` 
- **Auto Deploy**: Enabled for `main` branch
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

#### Deployment Workflow
1. **Push to main branch** → Triggers automatic deployment
2. **Pull Request** → Creates preview deployment
3. **Merge PR** → Deploys to production

#### URLs
- **Production**: [https://restaurant-management-test-38otlmzcb-diepvuminh123s-projects.vercel.app](https://restaurant-management-test-38otlmzcb-diepvuminh123s-projects.vercel.app)
- **Vercel Dashboard**: [https://vercel.com/diepvuminh123s-projects/restaurant-management-test](https://vercel.com/diepvuminh123s-projects/restaurant-management-test)
- **Preview**: Generated for each PR

#### ⚠️ GitHub Integration Fix
If GitHub shows deployment failures, it might be connected to the wrong Vercel project:

1. **Go to**: [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select**: `restaurant-management-test` project (NOT `restaurant-management`)
3. **Settings** → **Git** → **Connect Git Repository**
4. **Repository**: `diepvuminh123/Restaurant-management`
5. **Root Directory**: `frontend`
6. **Connect**

#### Manual Deployment (if needed)
```bash
# Navigate to frontend directory
cd frontend

# Deploy to production
vercel --prod

# Deploy to staging
vercel
```

#### Clean up Failed Deployments
```bash
# List all deployments
vercel ls

# Remove specific failed deployment
vercel rm <deployment-url> --yes

# Example:
vercel rm restaurant-management-test-abc123-projects.vercel.app --yes
```

### GitHub Actions CI/CD

**Note**: GitHub Actions đã được remove để tránh conflict với Vercel's native auto-deployment. Vercel sẽ tự động handle testing và deployment khi có push lên main branch.

#### Vercel Auto-Deployment Features:
- ✅ **Automatic builds** when code is pushed
- ✅ **Preview deployments** for Pull Requests  
- ✅ **Production deployment** for main branch
- ✅ **Build error notifications** via email/dashboard
- ✅ **Rollback capabilities** to previous versions

### Backend Deployment Options

1. **Heroku**
2. **Railway**
3. **Vercel Functions**
4. **DigitalOcean**

## 👥 Team Collaboration

### Git Workflow

1. **Clone the repository** (first time setup)
   ```bash
   git clone https://github.com/diepvuminh123/Restaurant-management.git
   ```

2. **Create a new branch** for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

4. **Push your branch** to GitHub
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub for code review

### Development Guidelines

- **Branch naming convention**: `feature/`, `bugfix/`, `hotfix/`
- **Commit message format**: `Add:`, `Fix:`, `Update:`, `Remove:`
- **Code review**: All changes must be reviewed before merging
- **Testing**: Test your changes locally before pushing

### Environment Setup for New Team Members

1. Follow the [Installation & Setup](#-installation--setup) steps
2. Create a `.env` file for environment variables (if needed)
3. Run both frontend and backend in development mode
4. Verify everything works by accessing `http://localhost:3000`

## ✨ Features

### Current Features
- ✅ Responsive Restaurant Management Dashboard
- ✅ Modern UI with dark theme
- ✅ Menu Management section
- ✅ Order Management section
- ✅ Table Management section
- ✅ Production-ready build system
- ✅ Vercel deployment integration

### Planned Features
- 🔄 Database integration (MongoDB/PostgreSQL)
- 🔄 User authentication and authorization
- 🔄 Real-time order tracking
- 🔄 Inventory management
- 🔄 Sales analytics and reporting
- 🔄 Mobile-responsive design improvements

## 📚 API Documentation

### Backend Endpoints (Planned)

```
GET    /api/menu          # Get all menu items
POST   /api/menu          # Create new menu item
PUT    /api/menu/:id      # Update menu item
DELETE /api/menu/:id      # Delete menu item

GET    /api/orders        # Get all orders
POST   /api/orders        # Create new order
PUT    /api/orders/:id    # Update order status
DELETE /api/orders/:id    # Cancel order

GET    /api/tables        # Get all tables
POST   /api/tables        # Create table reservation
PUT    /api/tables/:id    # Update table status
DELETE /api/tables/:id    # Remove reservation
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add: some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📞 Support

For questions or support, please contact:
- **GitHub**: [diepvuminh123](https://github.com/diepvuminh123)
- **Repository**: [Restaurant-management](https://github.com/diepvuminh123/Restaurant-management)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Coding! 🚀**


