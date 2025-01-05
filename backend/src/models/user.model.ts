import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database'; // Adjust the import based on your project structure

export class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public isVerified!: boolean;
  // Add other fields as necessary
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Add other fields as necessary
  },
  {
    sequelize, // passing the `sequelize` instance is required
    modelName: 'User', // We need to choose the model name
  }
); 