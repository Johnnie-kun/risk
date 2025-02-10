import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Prediction extends Model {
  public id!: number;
  public timestamp!: Date;
  public currentPrice!: number;
  public predictedPrice!: number;
  public timeframe!: '1h' | '4h' | '24h' | '7d';
  public confidence!: number;
  public features!: object;
  public accuracy?: number;
  public actualPrice?: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Prediction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    currentPrice: {
      type: DataTypes.DECIMAL(18, 2), // Price in USD
      allowNull: false,
    },
    predictedPrice: {
      type: DataTypes.DECIMAL(18, 2), // Predicted price in USD
      allowNull: false,
    },
    timeframe: {
      type: DataTypes.ENUM('1h', '4h', '24h', '7d'),
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    features: {
      type: DataTypes.JSONB, // Store features used for prediction
      allowNull: false,
    },
    accuracy: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },
    actualPrice: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Prediction',
    timestamps: true,
    indexes: [
      {
        fields: ['timestamp', 'timeframe'],
      },
    ],
  }
);