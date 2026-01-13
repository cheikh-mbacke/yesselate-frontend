'use client';

import * as React from 'react';
import { Button } from '@fluentui/react-components';

type FluentButtonProps = React.ComponentProps<typeof Button>;

/**
 * Compat ergonomique avec la terminologie Fluent UI v8 (PrimaryButton/DefaultButton),
 * mais implémenté avec Fluent UI v9 (Button + appearance).
 */
export function PrimaryButton(props: FluentButtonProps) {
  return <Button appearance="primary" {...props} />;
}

export function DefaultButton(props: FluentButtonProps) {
  return <Button appearance="secondary" {...props} />;
}

export function SubtleButton(props: FluentButtonProps) {
  return <Button appearance="subtle" {...props} />;
}


