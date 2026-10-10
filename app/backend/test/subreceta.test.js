import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import Ingrediente from "../models/ingrediente.model.js";
import Subreceta from "../models/subreceta.model.js";
import User from "../models/user.model.js";

let mongoServer;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_meraki";

  const user = await User.create({
    nombre: "Test",
    apellido: "Admin",
    email: "admin@test.com",
    role: "admin"
  });

  authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Subreceta.deleteMany({});
  await Ingrediente.deleteMany({});
});

describe("Subreceta API - Edición y cálculo de costos de ingredientes", () => {
  it("debería actualizar subreceta y conservar/recalcular costo cuando el ingrediente se envía como objeto populado", async () => {
    // 1. Crear ingrediente: Huevos (3.94 € por 12 unidades => 0.328333 € / unidad)
    const ingrediente = await Ingrediente.create({
      nombre: "Huevos",
      precio: 3.94,
      medida: 12,
      unidad: "unidad"
    });

    // 2. Crear subreceta con 6 unidades (costo = (3.94 / 12) * 6 = 1.97 €)
    const subrecetaCreada = await request(app)
      .post("/api/subrecetas")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        nombre: "Bizcocho",
        ingredientes: [
          {
            ingrediente: ingrediente._id.toString(),
            cantidad: 6
          }
        ]
      });

    expect(subrecetaCreada.statusCode).toBe(201);
    expect(subrecetaCreada.body.ingredientes[0].costo).toBe(1.97);

    // 3. Simular actualización enviando el objeto populado tal como lo devuelve el backend en un GET
    const subrecetaId = subrecetaCreada.body._id;
    const ingredientePopulado = subrecetaCreada.body.ingredientes[0].ingrediente;

    const resActualizacion = await request(app)
      .put(`/api/subrecetas/${subrecetaId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        nombre: "Bizcocho Editado",
        ingredientes: [
          {
            ingrediente: ingredientePopulado, // Objeto con _id, nombre, precio, etc.
            cantidad: 6
          }
        ]
      });

    expect(resActualizacion.statusCode).toBe(200);
    // El costo no debe pasar a 0
    expect(resActualizacion.body.ingredientes[0].costo).toBe(1.97);
    expect(resActualizacion.body.ingredientes[0].ingrediente._id.toString()).toBe(ingrediente._id.toString());
  });

  it("debería actualizar subreceta con cantidad modificada usando ID string y calcular nuevo costo", async () => {
    const ingrediente = await Ingrediente.create({
      nombre: "Huevos",
      precio: 3.94,
      medida: 12,
      unidad: "unidad"
    });

    const subrecetaCreada = await request(app)
      .post("/api/subrecetas")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        nombre: "Bizcocho",
        ingredientes: [
          {
            ingrediente: ingrediente._id.toString(),
            cantidad: 6
          }
        ]
      });

    const subrecetaId = subrecetaCreada.body._id;

    // Cambiar a 8 unidades: (3.94 / 12) * 8 = 2.63 €
    const resActualizacion = await request(app)
      .put(`/api/subrecetas/${subrecetaId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        nombre: "Bizcocho",
        ingredientes: [
          {
            ingrediente: ingrediente._id.toString(),
            cantidad: 8
          }
        ]
      });

    expect(resActualizacion.statusCode).toBe(200);
    expect(resActualizacion.body.ingredientes[0].costo).toBe(2.63);
  });
});
