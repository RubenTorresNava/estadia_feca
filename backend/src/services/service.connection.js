import pkg from 'pg';
import config from '../config.js';

const { Pool } = pkg;

const connection = new Pool({
    user: config.postgres_user,
    host: config.postgres_host,
    database: config.postgres_db,
    password: config.postgres_password,
    port: config.postgres_port,
})

export default connection;