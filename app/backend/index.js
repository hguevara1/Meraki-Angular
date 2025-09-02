// index.js
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
console.log('✅ Configurado para usar IPv4 preferentemente');

// ✅ SOLUCIÓN CONFIABLE - Usar dotenv normal
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determinar qué archivo cargar
const envFile = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log('📁 Cargando variables de:', envFile);
console.log('🔍 Variables cargadas:');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Cargado' : 'No encontrado');

import app from "./server.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor Express iniciado en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 URL de red: http://0.0.0.0:${PORT}`);
});