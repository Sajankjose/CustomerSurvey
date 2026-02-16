'use client';

import { useEffect } from 'react';
import { logger } from '@/infrastructure/logger';

export function useErrorBoundaryLogger(error: Error | null) {
  useEffect(() => {
    if (!error) return;
    logger.error('ui_error_boundary', { message: error.message });
  }, [error]);
}
