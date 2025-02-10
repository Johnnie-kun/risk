import { User } from './user.model';
import { Trading } from './trading.model';
import { Prediction } from './prediction.model';
import { sequelize } from '../config/database';

// Export all models and sequelize instance
export { User, Trading, Prediction, sequelize };

/**
 * Initialize all models and sync them with the database.
 * This function should be called when the application starts.
 */
export const initializeModels = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      console.log(`🔄 Connecting to the database... (Attempt ${attempts + 1})`);
      await sequelize.authenticate(); // Test the database connection
      console.log('✅ Database connection established successfully.');

      // Sync all models with the database
      await sequelize.sync({ alter: !isProduction, force: false });
      console.log('✅ All models synchronized successfully.');
      return;
    } catch (error) {
      console.error('❌ Database connection or model synchronization failed:', (error as Error).stack);
      attempts++;

      if (attempts >= maxAttempts) {
        console.error('❌ Max retry attempts reached. Exiting process.');
        process.exit(1);
      }

      console.log(`⏳ Retrying in 5 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
