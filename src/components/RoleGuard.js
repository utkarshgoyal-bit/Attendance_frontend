import { useAuth } from '../context/AuthContext';

/**
 * Component to conditionally render content based on user roles
 *
 * @param {Array<string>} roles - Array of roles that can access the content
 * @param {React.ReactNode} children - Content to render if user has permission
 * @param {React.ReactNode} fallback - Optional content to render if user lacks permission
 * @param {boolean} requireAll - If true, user must have ALL roles. If false, user needs ANY role. Default: false
 *
 * @example
 * // Show only to managers and admins
 * <RoleGuard roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}>
 *   <button>Approve</button>
 * </RoleGuard>
 *
 * @example
 * // Show to HR/Admin, show different content to others
 * <RoleGuard
 *   roles={['HR_ADMIN', 'SUPER_ADMIN']}
 *   fallback={<p>Access Denied</p>}
 * >
 *   <button>Process Salaries</button>
 * </RoleGuard>
 */
const RoleGuard = ({ roles, children, fallback = null, requireAll = false }) => {
  const { hasRole, user } = useAuth();

  // If no user, deny access
  if (!user) {
    return fallback;
  }

  // Check if user has required role(s)
  let hasPermission;

  if (requireAll) {
    // User must have ALL specified roles (rare use case)
    hasPermission = roles.every(role => user.role === role);
  } else {
    // User must have AT LEAST ONE of the specified roles (common use case)
    hasPermission = hasRole(...roles);
  }

  if (hasPermission) {
    return children;
  }

  return fallback;
};

export default RoleGuard;
