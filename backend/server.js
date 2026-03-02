
import dotenv from 'dotenv'
import cors from 'cors';
import connectDB from './config/db.js';
import express from 'express';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js'



dotenv.config()


const app = express();

connectDB();


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/api/auth',authRoutes)
app.use('/api/documents',documentRoutes);

app.get("/",(req,res)=>{
    res.send("Server running")
});

app.listen(5000,()=>{
    console.log("Server started on port 5000")
})

