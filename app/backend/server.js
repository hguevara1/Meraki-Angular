// server.js
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// ✅ Cargar variables de entorno PRIMERO
const envFile = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log('📁 Cargando variables de:', envFile);
console.log('🔍 Variables cargadas:');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Cargado' : 'No encontrado');

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import ingredienteRoutes from "./routes/ingrediente.routes.js";
import subrecetaRoutes from "./routes/subreceta.routes.js";
import tortaRoutes from "./routes/torta.routes.js";
import authRoutes from "./routes/authRoutes.js";
import configurePassport from "./config/passport.js";
import { authenticateToken } from "./middleware/auth.js";

// Conectar a la base de datos
connectDB();

const app = express();

// ✅ Configuración de CORS dinámica
const isProduction = process.env.NODE_ENV === 'production';
console.log('🎯 Entorno:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');

const allowedOrigins = isProduction
  ? [
      'https://meraki-sabores-de-amor.web.app',
      'https://meraki-sabores-de-amor.firebaseapp.com'
    ]
  : [
      'http://localhost:4200',
      'http://localhost:5000'
    ];

console.log('🌐 Orígenes permitidos:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log('🚫 Origen no permitido por CORS:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// ✅ Configurar passport
const passport = configurePassport();
app.use(passport.initialize());

// Rutas
app.get("/", (req, res) => res.send("API Meraki corriendo 🚀"));
app.get("/api/test", (req, res) => res.status(200).json({ message: "Backend working!" }));

// Rutas protegidas
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/ingredientes", authenticateToken, ingredienteRoutes);
app.use("/api/subrecetas", authenticateToken, subrecetaRoutes);
app.use("/api/tortas", authenticateToken, tortaRoutes);
app.use("/api/auth", authRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", message: "La ruta solicitada no existe." });
});

export default app;