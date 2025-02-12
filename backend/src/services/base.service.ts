export abstract class BaseService {
  private static instances = new Map<string, any>();

  protected constructor() {}

  static getInstance<T extends BaseService>(this: new () => T): T {
    const className = this.name;
    if (!this.instances.has(className)) {
      this.instances.set(className, new this());
    }
    return this.instances.get(className);
  }

  protected handleError(error: Error, context: string): never {
    console.error(`Error in ${context}:`, error);
    throw error;
  }

  protected async tryCatch<T>(
    operation: () => Promise<T>,
    context: string,
    defaultValue?: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }
} 