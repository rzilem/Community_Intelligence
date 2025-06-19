
class DevLogger {
  private isEnabled = process.env.NODE_ENV === 'development';

  info(message: string, ...args: any[]) {
    if (this.isEnabled) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.isEnabled) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.isEnabled) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.isEnabled) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const devLog = new DevLogger();
