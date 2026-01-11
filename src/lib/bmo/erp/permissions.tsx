'use client';

import React from 'react';

export type Permission =
  | 'BMO.VIEW'
  | 'BMO.EXPORT'
  | 'BMO.EDIT'
  | 'BMO.ADMIN'
  | string;

type PermissionsContextValue = {
  can: (perm: Permission) => boolean;
};

const PermissionsContext = React.createContext<PermissionsContextValue>({
  can: () => true, // phase 1: allow all (tu brancheras IAM plus tard)
});

export function PermissionsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: PermissionsContextValue;
}) {
  return (
    <PermissionsContext.Provider value={value ?? { can: () => true }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return React.useContext(PermissionsContext);
}

export function RequirePermission({
  perm,
  children,
  fallback = null,
}: {
  perm: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();
  return can(perm) ? <>{children}</> : <>{fallback}</>;
}

