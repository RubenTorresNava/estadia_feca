// config/db.js
import { Sequelize } from 'sequelize';
import config from '../config.js';

const sequelize = new Sequelize(
    config.postgres_db, 
    config.postgres_user, 
    config.postgres_password, 
    {
        host: config.postgres_host,
        port: config.postgres_port,
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