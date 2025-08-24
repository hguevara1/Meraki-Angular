// index.js
import app from "./server.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor Express iniciado en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 URL de red: http://0.0.0.0:${PORT}`);
});