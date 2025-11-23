import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: Number(process.env.DB_PORT) || 3306,
    logging: false,
  }
);

export default sequelize;
