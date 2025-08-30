// server.js
import express from "express";
import dotenv from "dotenv";
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

// Cargar variables de entorno PRIMERO
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// ✅ Configuración de CORS
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// ✅ Configurar passport DESPUÉS de cargar las variables de entorno
const passport = configurePassport();
app.use(passport.initialize());

console.log("✅ Google Client ID:", process.env.GOOGLE_CLIENT_ID ? "Cargado" : "No encontrado");
console.log("✅ Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "Cargado" : "No encontrado");

// Rutas
app.get("/", (req, res) => res.send("API Meraki corriendo 🚀"));
app.get("/api/test", (req, res) => res.status(200).json({ message: "Backend working!" }));

// Rutas de usuario
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