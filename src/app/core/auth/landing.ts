// src/app/core/auth/landing.ts
export function landingRouteForRole(roleName: string | null): string {
  const r = (roleName ?? '').toLowerCase();

  if (r === 'admin') return '/dashboard';
  if (r === 'patient') return '/my-record';

  // doctor / nurse / other staff
  return '/patients';
}
