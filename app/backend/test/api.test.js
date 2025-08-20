// test/api.test.js
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
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
    expect(res.body.error).toBe("Not Found");
  });
});
