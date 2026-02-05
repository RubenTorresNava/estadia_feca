import donenv from 'dotenv';

donenv.config();

const config = {
  port: process.env.PORT || 3000,
};

export default config;