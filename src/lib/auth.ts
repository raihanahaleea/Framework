import type { User } from '../types';

// We'll use a simple store pattern without zustand dep - using React context instead
// But let's export auth helper functions

export function getAccessToken(): string | null {
  return sessionStorage.getItem('accessToken');
}

export function setTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem('accessToken', accessToken);
  sessionStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
}

export function getStoredUser(): User | null {
  const raw = sessionStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getRolePath(role: string): string {
  switch (role) {
    case 'PENGHUNI': return '/penghuni';
    case 'FASIL': return '/fasil';
    case 'ADMIN': return '/admin';
    default: return '/login';
  }
}
