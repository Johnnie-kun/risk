import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Trading extends Model {
  public id!: number;
  public userId!: number;
  public type!: 'BUY' | 'SELL';
  public amount!: number;
  public price!: number;
  public total!: number;
  public status!: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  public executedAt!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Trading.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('BUY', 'SELL'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 8), // High precision for crypto amounts
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(18, 2), // Price in USD
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(18, 2), // Total in USD
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Trading',
    timestamps: true, // Enables createdAt and updatedAt
  }
);

// Establish relationship with User model
Trading.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Trading, {
  foreignKey: 'userId',
  as: 'trades',
});