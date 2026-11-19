import { LogEntry, LogLevel } from '@/logging/LogEntry';

export type MemoryLoggerEvent =
  { type: 'appended'; entry: LogEntry } | { type: 'cleared' };

type Listener = (event: MemoryLoggerEvent) => void;

class MemoryLogger {
  public static readonly INSTANCE = new MemoryLogger();
  private static readonly MAX_ENTRIES = 500;

  private readonly buffer: LogEntry[] = [];
  private readonly listeners: Set<Listener> = new Set();

  private constructor() {}

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public snapshot(): LogEntry[] {
    return this.buffer.slice();
  }

  public clear(): void {
    this.buffer.length = 0;
    this.emit({ type: 'cleared' });
  }

  public append(
    levelOrEntry: LogLevel | LogEntry,
    tag?: string,
    message?: string
  ): LogEntry {
    const entry: LogEntry =
      typeof levelOrEntry === 'string'
        ? {
            timestamp: Date.now(),
            level: levelOrEntry,
            tag: tag ?? '',
            message: message ?? '',
          }
        : levelOrEntry;

    if (this.buffer.length >= MemoryLogger.MAX_ENTRIES) {
      this.buffer.shift();
    }
    this.buffer.push(entry);
    this.emit({ type: 'appended', entry });
    return entry;
  }

  private emit(event: MemoryLoggerEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Ignore listener failures so logging never breaks app behavior.
      }
    });
  }
}

export default MemoryLogger;
