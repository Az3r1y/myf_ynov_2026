import request from "supertest";
import { faker } from "@faker-js/faker";
import app from "./app";
import datasource from "./datasource";
import { Address } from "./entities/Address";
import { User } from "./entities/User";
import * as geocodingModule from "./utils/getCoordinatesFromSearch";

jest.mock("./utils/getCoordinatesFromSearch");

const mockedGeocode =
  geocodingModule.getCoordinatesFromSearch as jest.MockedFunction<
    typeof geocodingModule.getCoordinatesFromSearch
  >;

describe("Addresses API integration scenario", () => {
  const testData: {
    email?: string;
    password?: string;
    token?: string;
  } = {};

  beforeAll(async () => {
    if (!datasource.isInitialized) {
      await datasource.initialize();
    }
    await datasource.getRepository(Address).clear();
    await datasource.getRepository(User).clear();

    testData.email = faker.internet.email().toLowerCase();
    testData.password = faker.internet.password({ length: 16 });

    await request(app).post("/api/users").send({
      email: testData.email,
      password: testData.password,
    });

    const loginRes = await request(app).post("/api/users/tokens").send({
      email: testData.email,
      password: testData.password,
    });

    testData.token = loginRes.body.token;
  });

  afterAll(async () => {
    if (datasource.isInitialized) {
      await datasource.destroy();
    }
  });

  test("POST /api/addresses returns 403 without authentication", async () => {
    const response = await request(app).post("/api/addresses").send({
      name: "Tour Eiffel",
      searchWord: "Paris",
    });

    expect(response.status).toBe(403);
  });

  test("POST /api/addresses returns 400 when name is missing", async () => {
    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ searchWord: "Paris" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("name and search word are required");
  });

  test("POST /api/addresses returns 400 when searchWord is missing", async () => {
    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ name: "Chez moi" });

    expect(response.status).toBe(400);
  });

  test("POST /api/addresses returns 404 when geocoding finds nothing", async () => {
    mockedGeocode.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ name: "Lieu introuvable", searchWord: "zzznowhere123" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("search word not found");
  });

  test("POST /api/addresses creates an address when geocoding succeeds", async () => {
    mockedGeocode.mockResolvedValue({ lng: 2.3522, lat: 48.8566 });

    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({
        name: "Paris centre",
        searchWord: "Paris",
        description: faker.lorem.sentence(),
      });

    expect(response.status).toBe(200);
    expect(response.body.item).toMatchObject({
      name: "Paris centre",
      lng: 2.3522,
      lat: 48.8566,
    });
    expect(response.body.item.id).toBeDefined();
  });

  test("GET /api/addresses returns 403 without authentication", async () => {
    const response = await request(app).get("/api/addresses");

    expect(response.status).toBe(403);
  });

  test("GET /api/addresses returns the list of addresses for the user", async () => {
    const response = await request(app)
      .get("/api/addresses")
      .set("Authorization", `Bearer ${testData.token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThanOrEqual(1);

    const paris = response.body.items.find(
      (a: { name: string }) => a.name === "Paris centre",
    );
    expect(paris).toBeDefined();
  });

  test("POST /api/addresses/searches returns 403 without authentication", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .send({ radius: 10, from: { lat: 48.8566, lng: 2.3522 } });

    expect(response.status).toBe(403);
  });

  test("POST /api/addresses/searches returns 400 when radius is missing", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ from: { lat: 48.8566, lng: 2.3522 } });

    expect(response.status).toBe(400);
  });

  test("POST /api/addresses/searches returns 400 when radius is negative", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ radius: -5, from: { lat: 48.8566, lng: 2.3522 } });

    expect(response.status).toBe(400);
  });

  test("POST /api/addresses/searches returns 400 when from is missing", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ radius: 10 });

    expect(response.status).toBe(400);
  });

  test("POST /api/addresses/searches returns addresses within the given radius", async () => {
    mockedGeocode.mockResolvedValue({ lng: 4.8357, lat: 45.764 });

    await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ name: "Lyon centre", searchWord: "Lyon" });

    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ radius: 10, from: { lat: 45.764, lng: 4.8357 } });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);

    const lyonAddr = response.body.items.find(
      (a: { name: string }) => a.name === "Lyon centre",
    );
    expect(lyonAddr).toBeDefined();
  });

  test("POST /api/addresses/searches excludes addresses outside the radius", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${testData.token}`)
      .send({ radius: 1, from: { lat: 45.764, lng: 4.8357 } });

    expect(response.status).toBe(200);

    const parisAddr = response.body.items.find(
      (a: { name: string }) => a.name === "Paris centre",
    );
    expect(parisAddr).toBeUndefined();
  });
});
