# HR Frontend v2.0 - Optimized & Lightweight

A streamlined React frontend for the HR Management System.

## 🚀 Quick Start

```bash
npm install
npm start
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui.jsx          # Reusable UI components (Button, Input, Table, etc.)
│   ├── Sidebar.jsx     # Navigation sidebar
│   └── Layout.jsx      # Page layout wrapper
├── context/
│   └── AuthContext.js  # Authentication state management
├── pages/
│   ├── auth/Login.jsx
│   ├── Home.jsx
│   ├── employees/
│   │   ├── Employees.jsx
│   │   └── AddEmployee.jsx
│   └── attendance/
│       └── Attendance.jsx
├── services/
│   └── api.js          # Centralized API client
├── App.js              # Routes & app structure
└── index.js            # Entry point
```

## 🎨 Components

### UI Components (src/components/ui.jsx)
- `ProtectedRoute` - Route protection with role checking
- `RoleGuard` - Conditional rendering based on roles
- `Button` - Styled button with variants
- `Input` - Form input with label/error
- `Select` - Dropdown select
- `Card` - Content card
- `Table` - Data table
- `Modal` - Dialog modal
- `Toast` - Notification toast
- `Badge` - Status badge
- `PageLoader` - Loading spinner

### Usage
```jsx
import { Button, Input, Card, Badge, RoleGuard } from './components/ui';

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="danger" loading={true}>Delete</Button>

// Role-based rendering
<RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
  <AdminOnlyContent />
</RoleGuard>
```

## 🔐 Authentication

```jsx
import { useAuth } from './context/AuthContext';

const { 
  user,           // Current user
  login,          // Login function
  logout,         // Logout function
  hasRole,        // Check specific roles
  hasMinRole,     // Check minimum role level
  isAuthenticated // Check if logged in
} = useAuth();
```

## 🔑 Role Hierarchy

```
SUPER_ADMIN (4) - Full access
  └── HR_ADMIN (3) - HR operations
        └── MANAGER (2) - Team management
              └── EMPLOYEE (1) - Self-service
```

## 📡 API Service

```jsx
import { api } from './services/api';

// Employees
await api.getEmployees({ page: 1, limit: 10 });
await api.createEmployee(data);

// Attendance
await api.getTodayAttendance({ status: 'PENDING' });
await api.approveAttendance(id);

// Salaries
await api.calculateSalary({ employeeId, month, year });
```

## 🎯 Features

✅ Role-based access control  
✅ Lazy loading for performance  
✅ Responsive design  
✅ Reusable components  
✅ Centralized API client  
✅ Toast notifications  
✅ Form validation  

## 🔧 Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📦 Dependencies

- react & react-dom
- react-router-dom
- axios
- lucide-react (icons)
- tailwindcss

---

Built with ❤️ for simplicity
