"use client";

// Global client-side error capture wiring for the dashboard
// /Users/matthewsimon/Projects/eac/eac/app/_components/debug/ErrorBoundaryClient.tsx

import { reportError } from '@/store';
import { useEffect } from 'react';

export function ErrorBoundaryClient() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportError('window.onerror', event.error ?? event.message);
    };
    const onUnhandled = (event: PromiseRejectionEvent) => {
      reportError('window.unhandledrejection', (event.reason as any) ?? 'unhandled rejection');
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, []);
  return null;
}
