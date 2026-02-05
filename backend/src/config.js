import donenv from 'dotenv';

donenv.config();

const config = {
  port: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  postgres_user: process.env.POSTGRES_USER,
  postgres_password: process.env.POSTGRES_PASSWORD,
  postgres_db: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  postgres_port: process.env.POSTGRES_PORT,
};

export default config;