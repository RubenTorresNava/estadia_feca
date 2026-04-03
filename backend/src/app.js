import express, {json} from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import { configurarRelaciones } from './models/index.js';
import AuthRoute from './routes/route.auth.js'
import AdministradorRoute from './routes/route.admin.js'
import DashboarRoute from './routes/route.dashboard.js'
import ProductoRoute from './routes/route.producto.js'
import AlumnoRoute from './routes/route.alumno.js'


const app = express();
app.use(morgan('dev'));
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-token']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

configurarRelaciones();
app.use('/api/auth', AuthRoute)
app.use('/uploads', express.static('uploads'))
app.use('/api/alumno', AlumnoRoute)
app.use('/api/administrador', AdministradorRoute)
app.use('/api/dashboard', DashboarRoute)
app.use('/api/producto', ProductoRoute)

export default app;