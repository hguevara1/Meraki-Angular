import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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

// Cargar variables de entorno
const envFile = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Conectar DB
connectDB();

const app = express();

// CORS dinámico
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction
  ? ['https://meraki-sabores-de-amor.web.app','https://meraki-sabores-de-amor.firebaseapp.com']
  : ['http://localhost:4200','http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.log('🚫 Origen no permitido por CORS:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Passport
const passport = configurePassport();
app.use(passport.initialize());

// Rutas
app.get("/", (req, res) => res.send("API Meraki corriendo 🚀"));
app.get("/api/test", (req, res) => res.status(200).json({ message: "Backend working!" }));

// 🔓 Rutas públicas
app.use("/api/auth", authRoutes);

// Rutas de usuarios (login/register públicas, CRUD protegidas internamente)
app.use("/api/users", userRoutes);

app.use("/api/ingredientes", authenticateToken, ingredienteRoutes);
app.use("/api/subrecetas", authenticateToken, subrecetaRoutes);
app.use("/api/tortas", authenticateToken, tortaRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Not Found", message: "La ruta solicitada no existe." }));

export default app;
