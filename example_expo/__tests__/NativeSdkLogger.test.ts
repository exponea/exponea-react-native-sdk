import type { LoggerEvent } from 'react-native-exponea-sdk';

import { LogLevel } from '@/logging/LogEntry';
import MemoryLogger from '@/logging/MemoryLogger';
import { appendNativeSdkLog } from '@/logging/NativeSdkLogger';

function sdkEvent(
  level: string,
  message: string,
  throwable?: string
): LoggerEvent {
  return {
    level: level as LoggerEvent['level'],
    message,
    ...(throwable === undefined ? {} : { throwable }),
  };
}

describe('appendNativeSdkLog', () => {
  beforeEach(() => {
    MemoryLogger.INSTANCE.clear();
  });

  afterEach(() => {
    MemoryLogger.INSTANCE.clear();
  });

  test.each([
    ['VERBOSE', LogLevel.VERBOSE],
    ['DBG', LogLevel.DEBUG],
    ['INFO', LogLevel.INFO],
    ['WARN', LogLevel.WARN],
    ['ERROR', LogLevel.ERROR],
  ] as const)('maps %s to %s', (nativeLevel, memoryLevel) => {
    appendNativeSdkLog(sdkEvent(nativeLevel, 'SDK message'));

    expect(MemoryLogger.INSTANCE.snapshot()).toEqual([
      expect.objectContaining({
        level: memoryLevel,
        tag: 'Exponea SDK',
        message: 'SDK message',
      }),
    ]);
  });

  test('appends the throwable stack trace after the native message', () => {
    appendNativeSdkLog(
      sdkEvent(
        'ERROR',
        'Request failed',
        'java.lang.IllegalStateException: Request failed'
      )
    );

    expect(MemoryLogger.INSTANCE.snapshot()[0]).toEqual(
      expect.objectContaining({
        message:
          'Request failed\njava.lang.IllegalStateException: Request failed',
      })
    );
  });

  test('does not append an OFF event', () => {
    appendNativeSdkLog(sdkEvent('OFF', 'Hidden log'));

    expect(MemoryLogger.INSTANCE.snapshot()).toEqual([]);
  });
});
