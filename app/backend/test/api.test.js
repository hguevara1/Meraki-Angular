import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";

// Aumentar timeout para CI


let mongoServer;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Memory Server connected');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB Memory Server:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('✅ MongoDB Memory Server stopped');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
});

describe("API Meraki", () => {
  it("Debería responder en /api/test", async () => {
    const res = await request(app).get("/api/test");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Backend working!");
  });

  it("Debería retornar 404 en ruta inexistente", async () => {
    const res = await request(app).get("/api/ruta-inexistente");
    expect(res.statusCode).toBe(404);
  });
});