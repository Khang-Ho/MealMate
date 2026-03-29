import React, { useEffect } from 'react';
import type { NativeMapboxViewProps } from './NativeMapboxView.types';

export const NativeMapboxView: React.FC<NativeMapboxViewProps> = ({ onUnavailable }) => {
  useEffect(() => {
    onUnavailable?.();
  }, [onUnavailable]);
  return null;
};
