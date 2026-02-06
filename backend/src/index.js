import app from './app.js';
import config from './config.js';
import connection from './service/service.connection.js';

const startServer = async () => {
  try {
    await connection.connect();
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