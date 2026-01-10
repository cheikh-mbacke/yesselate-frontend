'use client';

import * as React from 'react';
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useAppStore } from '@/lib/stores';

export function FluentProviderClient({ children }: { children: React.ReactNode }) {
  const { darkMode } = useAppStore();

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      {children}
    </FluentProvider>
  );
}


