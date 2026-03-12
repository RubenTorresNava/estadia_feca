// config/db.js
import { Sequelize } from 'sequelize';
import config from '../config.js';

const sequelize = new Sequelize(config.postgres_database_url,{
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
        }
    }
);

export default sequelize;