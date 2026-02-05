import app from './app.js';
import config from './config.js';

const startServer = () => {
  try {
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
};

startServer();