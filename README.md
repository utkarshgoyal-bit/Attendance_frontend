# 🏢 HR Management System - Frontend

A modern, role-based HR management web application built with React. Manage attendance, leaves, salaries, and organizational settings with an intuitive interface and powerful features.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🎯 Core Functionality
- ✅ **Attendance Management** - QR code-based check-in/check-out system
- ✅ **Leave Management** - Apply, approve, and track employee leaves
- ✅ **Salary Processing** - Calculate, approve, and export salary sheets
- ✅ **Role-Based Access Control** - 4-tier permission system
- ✅ **Real-time Dashboard** - Live attendance tracking and analytics
- ✅ **Export to Excel** - Download salary sheets and reports
- ✅ **QR Code Generation** - Dynamic QR codes for attendance

### 👥 User Roles
| Role | Access Level | Capabilities |
|------|--------------|-------------|
| **Employee** | Basic | Check-in, apply leave, view own records |
| **Manager** | Team Lead | Approve team attendance & leaves |
| **HR Admin** | Department | Manage salaries, process payroll |
| **Super Admin** | Full System | Organization settings, full control |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 10+
- Backend API running (see [Backend Repository](#))

### Installation

```bash
# Clone the repository
git clone https://github.com/utkarshgoyal-bit/Attendance_frontend.git
cd Attendance_frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL and configuration

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

---

## 📦 Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| **axios** | ^1.12.2 | HTTP client for API calls |
| **react-router-dom** | ^7.9.4 | Client-side routing |
| **lucide-react** | ^0.548.0 | Modern icon library |
| **recharts** | ^3.4.1 | Dashboard charts & analytics |
| **xlsx** | ^0.18.5 | Excel file generation |
| **file-saver** | ^2.0.5 | Download Excel files |
| **qrcode.react** | ^4.2.0 | QR code generation |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | ^3.4.18 | Utility-first CSS framework |
| **autoprefixer** | ^10.4.21 | CSS vendor prefixing |
| **react-scripts** | 5.0.1 | Build tooling |

---

## 🏗️ Project Structure

```
Attendance_frontend/
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   ├── favicon.ico           # Browser icon
│   ├── logo2.png             # App logo
│   └── robots.txt            # SEO configuration
│
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Sidebar.js       # UNUSED (duplicate)
│   │   ├── Toast.js         # Notification component
│   │   ├── RoleGuard.js     # Permission-based rendering
│   │   ├── ProtectedRoute.js # Route protection
│   │   └── FloatingCalculator.js
│   │
│   ├── context/             # React Context providers
│   │   └── AuthContext.js  # Authentication & role management
│   │
│   ├── pages/               # Page components
│   │   ├── admin/          # Admin panel pages
│   │   │   ├── AdminPanel.js
│   │   │   ├── SalaryManagement.js
│   │   │   ├── BulkSalaryProcessing.js
│   │   │   ├── EmployeeSalaryStructure.js
│   │   │   ├── StatutoryTemplates.js
│   │   │   ├── BranchManagement.js
│   │   │   ├── CreateEditOrganization.js
│   │   │   ├── ConfigManagement.js
│   │   │   ├── ManageOrganizations.js
│   │   │   ├── OrgSettings.js
│   │   │   ├── CreateTemplate.js
│   │   │   ├── ApprovedSalaries.js
│   │   │   ├── SalaryApproval.js
│   │   │   ├── SalaryProcessing.js
│   │   │   └── Sidebar.js    # Admin sidebar (USED)
│   │   │
│   │   ├── attendance/      # Attendance management
│   │   │   ├── AdminPanel.js   # UNUSED (duplicate)
│   │   │   ├── ManagerDashboard.js # Attendance approval
│   │   │   ├── EmployeeCheckin.js  # QR check-in
│   │   │   ├── QRDisplay.js        # QR code display
│   │   │   └── attendanceApi.js    # UNUSED (duplicate)
│   │   │
│   │   ├── dashboards/      # Role-based dashboards
│   │   │   ├── HRDashboard.js
│   │   │   ├── ManagerDashboard.js # UNUSED (duplicate)
│   │   │   └── EmployeeDashboard.js
│   │   │
│   │   ├── employees/       # Employee management
│   │   │   └── AddEmployee.js
│   │   │
│   │   ├── leave/          # Leave management
│   │   │   ├── LeaveApplication.js
│   │   │   └── LeaveManagement.js
│   │   │
│   │   ├── auth/           # Authentication
│   │   │   └── Login.js
│   │   │
│   │   ├── EmployeeTable.js
│   │   ├── Home.js
│   │   └── CalculateEmi.js
│   │
│   ├── services/            # API service layer
│   │   ├── apiClient.js    # Axios instance with interceptors
│   │   ├── attendanceApi.js # Attendance endpoints
│   │   ├── salaryConfigApi.js # Salary configuration
│   │   ├── employeeTableApi.js # Employee data
│   │   └── cacheService.js  # LocalStorage caching
│   │
│   ├── utils/              # Utility functions
│   │   ├── auth.js        # Token & user management
│   │   ├── calculations.js # Salary calculations
│   │   └── exportUtils.js  # Excel export utilities
│   │
│   ├── App.js              # Main app component & routing
│   ├── index.js            # React entry point
│   ├── index.css           # Global Tailwind styles
│   └── reportWebVitals.js  # Performance monitoring
│
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── README.md               # This file
├── ROLE_BASED_UI_GUIDE.md # Role implementation guide
└── TODO.md                 # Project tasks
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ORG_ID=your-organization-id
REACT_APP_NAME=HR Management System

# Optional
# REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
# REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
```

See `.env.example` for full configuration options.

---

## 📚 Available Scripts

### Development
```bash
npm start        # Start development server (localhost:3000)
npm run build    # Build for production
```

### Code Quality
```bash
npm test         # Run tests (if configured)
npm run lint     # Run ESLint (if configured)
```

---

## 🎨 Tech Stack

### Frontend Framework
- **React 19.2.0** - Modern React with hooks & context
- **React Router 7.9** - Client-side routing with lazy loading

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons

### State Management
- **React Context API** - Authentication & global state
- **Local Storage** - Client-side caching & persistence

### HTTP & API
- **Axios** - Promise-based HTTP client
- **API Interceptors** - Auto-attach auth tokens

### Data Visualization
- **Recharts** - Responsive charts for dashboards

### File Generation
- **XLSX** - Excel file creation
- **File-Saver** - Client-side file downloads
- **QRCode.react** - QR code generation

---

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

The application implements a 4-tier permission system:

```javascript
// Check user role
const { user, hasRole, hasMinRole, isHRAdmin } = useAuth();

// Conditional rendering
{hasMinRole('MANAGER') && (
  <button>Approve Attendance</button>
)}

// Component-level protection
<RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
  <SalaryManagement />
</RoleGuard>
```

See [`ROLE_BASED_UI_GUIDE.md`](./ROLE_BASED_UI_GUIDE.md) for detailed implementation guide.

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```javascript
<Route element={<ProtectedRoute allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']} />}>
  <Route path="/admin/salary" element={<SalaryManagement />} />
</Route>
```

---

## 📊 Key Features in Detail

### 1. QR Code Attendance
- Generate unique QR codes per branch/location
- Auto-refresh every 5 minutes for security
- Scan QR to mark attendance (check-in/check-out)
- Real-time status updates

### 2. Leave Management
- Apply for leaves with date range & reason
- Manager approval workflow
- Leave balance tracking
- Leave history & analytics

### 3. Salary Processing
- Define salary components (Basic, HRA, DA, etc.)
- Configure PF/ESI thresholds
- Bulk salary calculation
- Approval workflow
- Export to Excel with formatted sheets

### 4. Dashboard Analytics
- Real-time attendance charts (Recharts)
- Leave statistics
- Salary summaries
- Role-specific views

---

## 🔄 API Integration

### Base URL Configuration
```javascript
// src/services/apiClient.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Automatic Authentication
```javascript
// Request interceptor adds token automatically
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Caching Strategy
LocalStorage caching with TTL for frequently accessed data:
```javascript
// Cache salary config for 1 hour
cacheService.set('salaryConfig', data, 3600000);
```

---

## 🎯 Roadmap & Future Enhancements

### ✅ Completed (Phase 8)
- [x] Remove Material-UI dependency (~600KB saved)
- [x] Replace MUI components with Tailwind alternatives
- [x] Improve salary threshold input UX

### 🚧 In Progress
- [ ] Remove unused files (Phase 6 findings)
- [ ] Clean public folder (Phase 7)
- [ ] Complete documentation (Phase 9)

### 🔮 Planned
- [ ] JWT-based authentication
- [ ] Real-time notifications with WebSockets
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Performance optimization
  - [ ] Code splitting
  - [ ] Image lazy loading
  - [ ] Service worker for PWA

---

## 🐛 Known Issues

### Phase 6: Unused Files Identified
The following files are unused and can be safely removed:
- `src/components/Sidebar.js` (duplicate, 207 lines)
- `src/pages/attendance/AdminPanel.js` (duplicate, 183 lines)
- `src/pages/dashboards/ManagerDashboard.js` (duplicate, 85 lines)
- `src/pages/attendance/attendanceApi.js` (duplicate, 113 lines)
- `src/App.css` (unused default CRA styles, 38 lines)

**Total cleanup potential:** 626 lines, ~23KB

### Phase 5: Code Quality
- 53 `console.log` statements to remove (debug code)
- 29 `alert()` calls to replace with Toast notifications
- 1 hardcoded TODO: `REACT_APP_ORG_ID` in EmployeeCheckin.js

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "Add: feature description"`
4. Push and create a pull request

### Code Style
- Use Tailwind CSS for styling
- Follow React Hooks best practices
- Use functional components over class components
- Keep components under 300 lines
- Use meaningful variable names

### Commit Message Convention
```
Type: Brief description

Types:
- Add: New feature
- Update: Modify existing feature
- Fix: Bug fix
- Refactor: Code restructuring
- Remove: Delete code/files
- Docs: Documentation changes
```

---

## 📞 Support & Documentation

- **API Documentation:** See backend repository
- **Role System Guide:** [`ROLE_BASED_UI_GUIDE.md`](./ROLE_BASED_UI_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/utkarshgoyal-bit/Attendance_frontend/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons
- [Recharts](https://recharts.org/) - Charts

---

## 📈 Recent Optimizations (Phase 8)

### Material-UI Removal
**Bundle size reduction: ~600KB**

**Before:**
- @mui/material + @emotion packages
- Complex slider components
- Inline styles with `sx` prop

**After:**
- Pure Tailwind CSS
- Intuitive number inputs
- Visual progress bars
- Better mobile UX

**Commit:** `3116e4f4 - Refactor: Remove Material-UI dependency (~600KB bundle reduction)`

**Files changed:** 3 files, 112 insertions(+), 697 deletions(-)

---

**Built with ❤️ by the HR Management Team**
