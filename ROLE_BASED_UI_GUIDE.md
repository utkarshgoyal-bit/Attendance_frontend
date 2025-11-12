# Role-Based UI Implementation Guide

## Overview

The frontend now implements role-based access control (RBAC) to show/hide menu items and features based on user permissions.

## Components Created

### 1. AuthContext (`src/context/AuthContext.js`)

Manages user authentication state and provides role checking utilities.

**Features:**
- Stores user information in state and localStorage
- Provides hooks for role checking
- Auto-persists user data across sessions

**Available Hooks:**
```javascript
const {
  user,              // Current user object
  setUser,           // Update user
  hasRole,           // Check if user has specific role(s)
  hasMinRole,        // Check if user meets minimum role level
  isRole,            // Check if user is exact role
  isEmployee,        // Quick check for EMPLOYEE
  isManager,         // Quick check for MANAGER or above
  isHRAdmin,         // Quick check for HR_ADMIN or above
  isSuperAdmin,      // Quick check for SUPER_ADMIN
  login,             // Login user
  logout,            // Logout user
  updateUser         // Update user data
} = useAuth();
```

### 2. RoleGuard Component (`src/components/RoleGuard.js`)

Conditionally renders content based on user roles.

**Usage:**
```javascript
<RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
  <button>Process Salaries</button>
</RoleGuard>

// With fallback
<RoleGuard
  roles={['MANAGER', 'HR_ADMIN']}
  fallback={<p>Access Denied</p>}
>
  <button>Approve</button>
</RoleGuard>
```

## Testing Different Roles

### Method 1: Change Default Role in AuthContext

Edit `src/context/AuthContext.js`:

```javascript
return {
  id: '673db4bb4ea85b50f50f20d4',
  employeeId: '673db4bb4ea85b50f50f20d4',
  role: 'EMPLOYEE', // Change this line
  name: 'Test User',
  email: 'test@maitrii.com'
};
```

**Available Roles:**
- `EMPLOYEE` - Basic employee access
- `MANAGER` - Manager with team approval rights
- `HR_ADMIN` - HR administrator with salary access
- `SUPER_ADMIN` - Full system access

### Method 2: Use Browser Console

Open browser console and run:

```javascript
// Change role to EMPLOYEE
localStorage.setItem('user', JSON.stringify({
  id: '673db4bb4ea85b50f50f20d4',
  employeeId: '673db4bb4ea85b50f50f20d4',
  role: 'EMPLOYEE',
  name: 'Employee User',
  email: 'employee@maitrii.com'
}));
location.reload();

// Change role to MANAGER
localStorage.setItem('user', JSON.stringify({
  id: '673db4bb4ea85b50f50f20d4',
  employeeId: '673db4bb4ea85b50f50f20d4',
  role: 'MANAGER',
  name: 'Manager User',
  email: 'manager@maitrii.com'
}));
location.reload();

// Change role to HR_ADMIN
localStorage.setItem('user', JSON.stringify({
  id: '673db4bb4ea85b50f50f20d4',
  employeeId: '673db4bb4ea85b50f50f20d4',
  role: 'HR_ADMIN',
  name: 'HR Admin',
  email: 'hr@maitrii.com'
}));
location.reload();

// Change role to SUPER_ADMIN
localStorage.setItem('user', JSON.stringify({
  id: '673db4bb4ea85b50f50f20d4',
  employeeId: '673db4bb4ea85b50f50f20d4',
  role: 'SUPER_ADMIN',
  name: 'Super Admin',
  email: 'admin@maitrii.com'
}));
location.reload();
```

## UI Elements by Role

### Employee (EMPLOYEE)

**Can See:**
- Check-In button
- Apply for Leave button
- Own attendance records
- Own leave balance

**Cannot See:**
- Attendance Approval
- Leave Management
- Salary Management
- Salary Processing
- Organization Settings
- Sidebar menu items

### Manager (MANAGER)

**Can See (Everything Employee sees +):**
- Attendance Approval
- Leave Management
- Team member data

**Cannot See:**
- Salary Management
- Salary Processing
- Organization Settings
- Salary-related sidebar items

### HR Admin (HR_ADMIN)

**Can See (Everything Manager sees +):**
- Manage Employee Salaries
- Salary Configuration
- Process Salaries
- Salary Management sidebar item
- Salary Processing sidebar item
- All employee data

**Cannot See:**
- Organization Settings (Super Admin only)
- Settings sidebar item

### Super Admin (SUPER_ADMIN)

**Can See:**
- Everything (full access)
- Organization Settings
- Settings sidebar item
- All features and menu items

## AdminPanel Quick Actions Matrix

| Feature | Employee | Manager | HR Admin | Super Admin |
|---------|----------|---------|----------|-------------|
| Check-In | ✅ | ✅ | ✅ | ✅ |
| Apply for Leave | ✅ | ✅ | ✅ | ✅ |
| Attendance Approval | ❌ | ✅ | ✅ | ✅ |
| Leave Management | ❌ | ✅ | ✅ | ✅ |
| Manage Employee Salaries | ❌ | ❌ | ✅ | ✅ |
| Salary Configuration | ❌ | ❌ | ✅ | ✅ |
| Process Salaries | ❌ | ❌ | ✅ | ✅ |
| Organization Settings | ❌ | ❌ | ❌ | ✅ |

## Sidebar Menu Matrix

| Item | Employee | Manager | HR Admin | Super Admin |
|------|----------|---------|----------|-------------|
| Salary Management | ❌ | ❌ | ✅ | ✅ |
| Process Salaries | ❌ | ❌ | ✅ | ✅ |
| Settings | ❌ | ❌ | ❌ | ✅ |

## API Integration

The API client automatically includes role headers in all requests:

```javascript
// Automatically added to all API calls
headers: {
  'x-user-role': 'SUPER_ADMIN',
  'x-user-id': '673db4bb4ea85b50f50f20d4',
  'x-employee-id': '673db4bb4ea85b50f50f20d4'
}
```

This ensures backend route protection works seamlessly with frontend role checks.

## Implementation Examples

### Using useAuth Hook

```javascript
import { useAuth } from '../../context/AuthContext';

const MyComponent = () => {
  const { user, isHRAdmin, hasRole } = useAuth();

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Role: {user?.role}</p>

      {isHRAdmin() && (
        <button>Process Salaries</button>
      )}

      {hasRole('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN') && (
        <button>Approve Attendance</button>
      )}
    </div>
  );
};
```

### Using RoleGuard Component

```javascript
import RoleGuard from '../../components/RoleGuard';

const Dashboard = () => {
  return (
    <div>
      {/* Show to everyone */}
      <button>Check In</button>

      {/* Show only to managers and above */}
      <RoleGuard roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}>
        <button>Approve Team Attendance</button>
      </RoleGuard>

      {/* Show only to HR and Super Admin */}
      <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
        <button>Process Payroll</button>
      </RoleGuard>

      {/* Show only to Super Admin */}
      <RoleGuard roles={['SUPER_ADMIN']}>
        <button>Configure System</button>
      </RoleGuard>

      {/* With fallback message */}
      <RoleGuard
        roles={['HR_ADMIN', 'SUPER_ADMIN']}
        fallback={<p>You need HR permissions to access this</p>}
      >
        <SalaryTable />
      </RoleGuard>
    </div>
  );
};
```

### Conditional Rendering

```javascript
import { useAuth } from '../../context/AuthContext';

const Navigation = () => {
  const { hasMinRole } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/attendance/checkin">Check In</Link>
      <Link to="/leave/apply">Apply Leave</Link>

      {hasMinRole('MANAGER') && (
        <>
          <Link to="/admin/attendance">Approve Attendance</Link>
          <Link to="/leave/manage">Manage Leaves</Link>
        </>
      )}

      {hasMinRole('HR_ADMIN') && (
        <>
          <Link to="/admin/salary-management">Salary Management</Link>
          <Link to="/admin/salary-processing">Process Salaries</Link>
        </>
      )}

      {hasMinRole('SUPER_ADMIN') && (
        <Link to="/admin/config">System Settings</Link>
      )}
    </nav>
  );
};
```

## Role Hierarchy

The system uses a hierarchical role structure:

```
SUPER_ADMIN (Level 4)
    ↓ (inherits all permissions below)
HR_ADMIN (Level 3)
    ↓ (inherits all permissions below)
MANAGER (Level 2)
    ↓ (inherits all permissions below)
EMPLOYEE (Level 1)
```

**Using hasMinRole():**
```javascript
// Check if user is at least MANAGER level
// Returns true for MANAGER, HR_ADMIN, and SUPER_ADMIN
hasMinRole('MANAGER')

// Check if user is at least HR_ADMIN level
// Returns true for HR_ADMIN and SUPER_ADMIN
hasMinRole('HR_ADMIN')
```

## Best Practices

1. **Use RoleGuard for UI elements**
   - Cleaner JSX
   - Consistent pattern across app

2. **Use hasRole() for multiple specific roles**
   ```javascript
   hasRole('MANAGER', 'HR_ADMIN') // User must be one of these
   ```

3. **Use hasMinRole() for hierarchical checks**
   ```javascript
   hasMinRole('MANAGER') // User must be MANAGER or above
   ```

4. **Always provide fallback for critical features**
   ```javascript
   <RoleGuard
     roles={['HR_ADMIN']}
     fallback={<AccessDenied />}
   >
     <SalaryData />
   </RoleGuard>
   ```

5. **Keep role checks consistent**
   - If backend requires `['HR_ADMIN', 'SUPER_ADMIN']`
   - Frontend should use same roles in RoleGuard

## Troubleshooting

### Issue: Role changes not reflecting

**Solution:**
Clear localStorage and reload:
```javascript
localStorage.clear();
location.reload();
```

### Issue: API returns 403 Forbidden

**Cause:** Frontend role doesn't match backend requirements

**Solution:**
Check that:
1. User role in localStorage matches intended role
2. API route protection matches frontend RoleGuard
3. Headers are being sent correctly (check Network tab)

### Issue: UI shows elements but API denies access

**Cause:** Frontend and backend role requirements are mismatched

**Solution:**
Ensure frontend RoleGuard roles match backend requireRole() parameters

## Future Enhancements

1. **JWT Authentication**
   - Replace localStorage with secure tokens
   - Auto-refresh tokens
   - Secure logout

2. **Login Page**
   - Replace hardcoded user with login form
   - Authenticate against backend
   - Redirect based on role

3. **Route Protection**
   - Add PrivateRoute component
   - Redirect unauthorized users
   - Role-based redirects

4. **Dynamic Role Assignment**
   - Allow admins to change user roles
   - Real-time role updates
   - Audit logging

## Summary

The role-based UI system provides:
- ✅ Granular access control
- ✅ Easy to use hooks and components
- ✅ Automatic API header injection
- ✅ Persistent user state
- ✅ Clean, maintainable code
- ✅ Consistent UX across roles

Test different roles to see the UI adapt dynamically!
