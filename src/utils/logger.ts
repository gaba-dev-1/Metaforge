export enum LogSeverity {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

export function logMessage(severity: LogSeverity, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${severity.toUpperCase()}] ${message}`;
  
  switch (severity) {
    case LogSeverity.ERROR:
      if (data) {
        console.error(logEntry, data);
      } else {
        console.error(logEntry);
      }
      break;
    case LogSeverity.WARN:
      if (data) {
        console.warn(logEntry, data);
      } else {
        console.warn(logEntry);
      }
      break;
    case LogSeverity.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        if (data) {
          console.log(logEntry, data);
        } else {
          console.log(logEntry);
        }
      }
      break;
    default:
      if (data) {
        console.log(logEntry, data);
      } else {
        console.log(logEntry);
      }
  }
}
