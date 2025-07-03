import React from 'react';
import { Button } from 'antd';
import theme from '../theme';

export default function CustomButton({ children, ...props }) {
  return (
    <Button
      style={{
        backgroundColor: theme.colors.primary,
        color: '#fff',
        borderRadius: theme.borderRadius.md,
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

