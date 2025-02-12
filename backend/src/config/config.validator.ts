interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean';
  validator?: (value: any) => boolean;
  message?: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export class ConfigValidator {
  static validate(config: Record<string, any>, rules: ValidationRules): void {
    for (const [key, rule] of Object.entries(rules)) {
      const value = config[key];

      // Check required fields
      if (rule.required && (value === undefined || value === null)) {
        throw new Error(rule.message || `Missing required configuration: ${key}`);
      }

      // Skip further validation if value is not provided and field is optional
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rule.type) {
        const actualType = typeof value;
        if (rule.type === 'number' && actualType === 'string') {
          if (isNaN(Number(value))) {
            throw new Error(`Invalid number format for ${key}`);
          }
        } else if (actualType !== rule.type) {
          throw new Error(`Invalid type for ${key}: expected ${rule.type}, got ${actualType}`);
        }
      }

      // Custom validation
      if (rule.validator && !rule.validator(value)) {
        throw new Error(rule.message || `Validation failed for ${key}`);
      }
    }
  }
}

// Example usage:
export const createRedisConfigRules = (): ValidationRules => ({
  host: {
    required: true,
    type: 'string',
    message: 'Missing Redis host in environment variables'
  },
  port: {
    required: true,
    type: 'number',
    validator: (value) => !isNaN(value) && value > 0 && value < 65536,
    message: 'Invalid Redis port number'
  },
  password: {
    required: false,
    type: 'string'
  },
  db: {
    required: false,
    type: 'number',
    validator: (value) => !isNaN(value) && value >= 0,
    message: 'Invalid Redis database index'
  }
});

export const createEmailConfigRules = (): ValidationRules => ({
  host: {
    required: true,
    type: 'string',
    message: 'Missing email host in environment variables'
  },
  port: {
    required: true,
    type: 'number',
    validator: (value) => !isNaN(value) && value > 0 && value < 65536,
    message: 'Invalid email port number'
  },
  secure: {
    required: false,
    type: 'boolean'
  },
  auth: {
    required: true,
    validator: (value) => value && value.user && value.pass,
    message: 'Missing email authentication credentials'
  }
}); 