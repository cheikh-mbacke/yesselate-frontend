/**
 * Layout for Alerts routes
 * Uses the App component with sidebar alerts
 */

import React from 'react';
import { App } from '@/components/features/bmo/calendrier/command-center';

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <App>{children}</App>;
}

