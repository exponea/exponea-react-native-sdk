import type { LoggerEvent } from 'react-native-exponea-sdk';

import { LogLevel } from '@/logging/LogEntry';
import MemoryLogger from '@/logging/MemoryLogger';

const SDK_LOG_TAG = 'Exponea SDK';

function toMemoryLogLevel(level: LoggerEvent['level']): LogLevel | null {
  switch (level) {
    case 'VERBOSE':
      return LogLevel.VERBOSE;
    case 'DBG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    case 'OFF':
      return null;
    default:
      return null;
  }
}

/** Adds one native SDK logger event to the example app's in-memory log viewer. */
export function appendNativeSdkLog(event: LoggerEvent): void {
  const level = toMemoryLogLevel(event.level);
  if (level === null) {
    return;
  }

  MemoryLogger.INSTANCE.append(
    level,
    SDK_LOG_TAG,
    [event.message, event.throwable].filter(Boolean).join('\n')
  );
}
