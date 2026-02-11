import app from './app.js';
import config from './config.js';
import sequelize from './services/service.connection.js';
import  tarea  from './services/service.cron.js';

const startServer = async () => {

  try {
    await sequelize.authenticate();
    await sequelize.sync()

    tarea();
    console.log('Conexión establecida con la base de datos');

    app.listen(config.port, () => {
      console.log(`Servidor corriendo en: http://localhost:${config.port}`);
    });

  } catch (error) {
    console.error('Error crítico al iniciar:', error.message);
    process.exit(1); 
  }
};

startServer();