import express, {json} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import AdministradorRoute from './routes/route.admin.js'
import checkoutroute from './routes/route.checkout.js'
import DashboarRoute from './routes/route.dashboard.js'


const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/uploads', express.static('uploads'))
app.use('/api/administrador', AdministradorRoute)
app.use('/api/checkout', checkoutroute)
app.use('/api/dashboard', DashboarRoute)



export default app;