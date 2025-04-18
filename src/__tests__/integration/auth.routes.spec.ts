import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import User from "../../models/userModel";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("Auth routes (integration)", () => {
  const email = "test@example.com";
  const password = "Secret123!";
  let refreshToken: string;

  it("POST /api/auth/register → 201 + user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Tester", email, password });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email, name: "Tester" });
    expect(res.body.isVerified).toBe(false);
  });

  it("POST /api/auth/login → 200 + tokens", async () => {
    await User.create({ name: "T", email, password, isVerified: true });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    refreshToken = res.body.refreshToken;
  });

  it("POST /api/auth/refresh-token → 200 with new pair", async () => {
    await User.create({ name: "T", email, password, isVerified: true });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    refreshToken = loginRes.body.refreshToken;

    const res2 = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });
    expect(res2.status).toBe(200);
    expect(res2.body.accessToken).toBeDefined();
    expect(res2.body.refreshToken).toBeDefined();
  });

  it("POST /api/auth/refresh-token with bad token → 401", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: "invalid" });
    expect(res.status).toBe(401);
  });
});
