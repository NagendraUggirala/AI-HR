# AI Recruitment HR Automation - Frontend

## 📁 Project Structure

```
src/
├── App.js                 # Main application routing and component
├── index.js              # React DOM rendering and app initialization
├── index.css             # Global styles
├── App.css               # App-specific styles
├── data.json             # Static data for dashboard metrics
└── components/
    ├── auth/             # Authentication Components
    │   ├── Login.jsx     # User login form
    │   ├── Signup.jsx    # User registration form
    │   └── ForgotPassword.jsx # Password recovery form
    ├── jobs/             # Job Management Components
    │   ├── PostJob.jsx   # Job posting form component
    │   └── PostJobPage.jsx # Job posting page with layout
    └── layout/           # Layout Components
        ├── dashboard/    # Dashboard Layout
        │   ├── Dashboard.jsx # Main dashboard page
        │   ├── Sidebars.jsx  # Sidebar layout wrapper
        │   └── Child/        # Dashboard child components
        │       ├── Counters.jsx      # Dashboard metrics counters
        │       └── DashBoardHeader.jsx # Dashboard header
        └── SidebarContent/   # Sidebar Navigation
            └── SidebarNames.jsx # Sidebar navigation items
```

## 🧭 Navigation Structure

### Authentication Flow
- `/` - Signup page (default)
- `/login` - Login page
- `/forgot-password` - Password recovery

### Main Application
- `/dashboard` - Main dashboard with metrics
- `/post-job` - Job posting form

## 📋 Component Overview

### Authentication Components (`/auth`)
- **Login.jsx** - Handles user authentication
- **Signup.jsx** - User registration functionality
- **ForgotPassword.jsx** - Password recovery process

### Job Management (`/jobs`)
- **PostJob.jsx** - Comprehensive job posting form with fields:
  - Basic Information (title, company, location, department)
  - Job Details (type, work mode, experience level)
  - Compensation (salary, currency)
  - Job Description and Requirements
  - Application Details (deadline, contact info)
- **PostJobPage.jsx** - Wrapper component with sidebar layout

### Layout Components (`/layout`)
- **Dashboard.jsx** - Main dashboard page with metrics
- **Sidebars.jsx** - Sidebar layout wrapper with:
  - Collapsible sidebar
  - Search functionality
  - Notification dropdown
  - User profile menu
- **SidebarNames.jsx** - Navigation menu items
- **Counters.jsx** - Dashboard metrics display
- **DashBoardHeader.jsx** - Dashboard page header

## 🎨 Styling
- **Bootstrap 5** - Main CSS framework
- **Custom CSS** - Additional styling in index.css and App.css
- **Iconify Icons** - Icon library for UI elements

## 📊 Data Management
- **data.json** - Contains dashboard metrics data:
  - Jobs count and statistics
  - Applicants metrics
  - Selected candidates data

## 🔧 Key Features
- Responsive design with mobile-friendly sidebar
- Form validation for job posting
- Clean, organized component structure
- Modular and maintainable code architecture
- Bootstrap-based UI components

## 🚀 Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Build for production: `npm run build`

## 📝 Development Notes
- All components use functional components with React hooks
- Consistent naming conventions throughout the project
- Organized folder structure for easy maintenance
- Clean separation of concerns between components

