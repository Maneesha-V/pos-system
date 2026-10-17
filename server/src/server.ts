import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import { errorHandler, notFound } from './middlewares/error';
import productRoutes from './routes/productRoutes';
import staffRoutes from './routes/staffRoutes';
import supplierRoutes from './routes/supplierRoutes';
import saleRoutes from './routes/saleRoutes';
import returnRoutes from './routes/returnRoutes';
import reportRoutes from './routes/reportRoutes';

connectDB();
const app = express();
app.use(cors({ 
    origin: process.env.CLIENT_URL || "http://localhost:5173"
 }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);  
app.use('/api/staff', staffRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`API on port ${port}`));