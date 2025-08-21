// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import ingredienteRoutes from "./routes/ingrediente.routes.js";
import subrecetaRoutes from "./routes/subreceta.routes.js";
import tortaRoutes from "./routes/torta.routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: 'http://localhost:4200', // URL de tu Angular app
  credentials: true
}));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Rutas
app.get("/", (req, res) => res.send("API Meraki corriendo 🚀"));
app.get("/api/test", (req, res) => res.status(200).json({ message: "Backend working!" }));

// Rutas de usuario
app.use("/api/users", userRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/ingredientes", ingredienteRoutes);
app.use("/api/subrecetas", subrecetaRoutes);
app.use("/api/tortas", tortaRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", message: "La ruta solicitada no existe." });
});

// Exportamos SOLO la app (sin levantar servidor)
export default app;
