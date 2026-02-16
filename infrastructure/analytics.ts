import { logger } from '@/infrastructure/logger';

export function track(event: string, data: Record<string, unknown> = {}) {
  logger.info('analytics_event', { event, ...data });
}
