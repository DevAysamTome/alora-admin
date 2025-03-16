'use client';
import { AuthProvider } from './AuthProvider';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
