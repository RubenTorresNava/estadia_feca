import express, {json} from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import AdministradorRoute from './routes/route.admin.js'
import checkoutroute from './routes/route.checkout.js'
import DashboarRoute from './routes/route.dashboard.js'
import ProductoRoute from './routes/route.producto.js'


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

app.use('/uploads', express.static('uploads'))
app.use('/api/administrador', AdministradorRoute)
app.use('/api/checkout', checkoutroute)
app.use('/api/dashboard', DashboarRoute)
app.use('/api/producto', ProductoRoute)

export default app;