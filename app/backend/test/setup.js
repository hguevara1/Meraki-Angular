// test/setup.js
import mongoose from 'mongoose';

// Silenciar logs de Mongoose durante los tests
mongoose.set('debug', false);

// Configuración global para tests
global.console = {
  ...console,
  // Silenciar console.log durante tests si es necesario
  // log: jest.fn(),
};