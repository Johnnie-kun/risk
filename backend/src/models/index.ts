import { User } from './user.model';
import { Trading } from './trading.model';
import { Prediction } from './prediction.model';
import { sequelize } from '../config/database';

// Export all models
export {
  User,
  Trading,
  Prediction,
  sequelize,
};

// Initialize models (this will sync all models with the database)
export const initializeModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    // In production, you might want to use migrations instead of sync
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
