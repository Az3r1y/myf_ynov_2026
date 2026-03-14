import request from "supertest";
import { faker } from "@faker-js/faker";
import app from "./app";
import datasource from "./datasource";
import { Address } from "./entities/Address";
import { User } from "./entities/User";

describe("Users API integration scenario", () => {
  const testData: {
    email?: string;
    password?: string;
    token?: string;
    userId?: number;
  } = {};

  beforeAll(async () => {
    if (!datasource.isInitialized) {
      await datasource.initialize();
    }
    await datasource.getRepository(Address).clear();
    await datasource.getRepository(User).clear();

    testData.email = faker.internet.email().toLowerCase();
    testData.password = faker.internet.password({ length: 16 });
    testData.token = undefined;
    testData.userId = undefined;
  });

  afterAll(async () => {
    if (datasource.isInitialized) {
      await datasource.destroy();
    }
  });

  test("POST /api/users creates a user with fake credentials", async () => {
    const response = await request(app).post("/api/users").send({
      email: testData.email,
      password: testData.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.item).toMatchObject({
      email: testData.email,
    });
    expect(response.body.item.hashedPassword).not.toBe(testData.password);
    expect(response.body.item.id).toBeDefined();

    testData.userId = response.body.item.id;
  });

  test("POST /api/users returns 400 when email is missing", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ password: "somepassword" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("email and password are required");
  });

  test("POST /api/users returns 400 when password is missing", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: faker.internet.email() });

    expect(response.status).toBe(400);
  });

  test("POST /api/users/tokens logs in the existing user", async () => {
    const response = await request(app).post("/api/users/tokens").send({
      email: testData.email,
      password: testData.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();

    testData.token = response.body.token;
  });

  test("POST /api/users/tokens returns 400 with a wrong password", async () => {
    const response = await request(app).post("/api/users/tokens").send({
      email: testData.email,
      password: "definitely-wrong-password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("wrong credentials");
  });

  test("POST /api/users/tokens returns 400 for a non-existent user", async () => {
    const response = await request(app).post("/api/users/tokens").send({
      email: "nobody@example.com",
      password: "somepassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("wrong credentials");
  });

  test("POST /api/users/tokens returns 400 when fields are missing", async () => {
    const response = await request(app)
      .post("/api/users/tokens")
      .send({ email: testData.email });

    expect(response.status).toBe(400);
  });

  test("GET /api/users/me returns current user profile when authenticated", async () => {
    const profileResponse = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${testData.token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.item.email).toBe(testData.email);
    expect(profileResponse.body.item.id).toBeDefined();
  });

  test("GET /api/users/me returns 403 without a token", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(403);
  });

  test("GET /api/users/me returns 403 with an invalid token", async () => {
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer this.is.not.valid");

    expect(response.status).toBe(403);
  });
});
