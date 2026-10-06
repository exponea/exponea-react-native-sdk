export enum LogLevel {
  VERBOSE = 'V',
  DEBUG = 'D',
  INFO = 'I',
  WARN = 'W',
  ERROR = 'E',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  tag: string;
  message: string;
}
