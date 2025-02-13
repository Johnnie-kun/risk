export abstract class BaseService {
  protected constructor() {}

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