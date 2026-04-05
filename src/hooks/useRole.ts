import { useStore } from '../store/useStore';

/**
 * Role-based access control hook.
 * Returns current role + permission helpers.
 */
export function useRole() {
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);

  return {
    role,
    setRole,
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
    canEdit: role === 'admin',
    canDelete: role === 'admin',
    canAdd: role === 'admin',
    canExport: true, // Both roles can export
  };
}