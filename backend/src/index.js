import app from './app.js';
import config from './config.js';
import sequelize from './services/service.connection.js';

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync()
    console.log('Conexión establecida con la base de datos');

    app.listen(config.port, () => {
      console.log(`Servidor corriendo en: http://localhost:${config.port}`);
    });

  } catch (error) {
    console.error('Error crítico al iniciar:', error.message);
    process.exit(1); // Detén el proceso si no hay base de datos
  }
};

startServer();