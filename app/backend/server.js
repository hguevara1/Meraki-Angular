// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

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

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", message: "La ruta solicitada no existe." });
});

// Exportamos SOLO la app (sin levantar servidor)
export default app;
