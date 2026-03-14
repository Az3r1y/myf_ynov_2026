import request from "supertest";
import app from "../src/app";

describe("Express app — unmatched routes", () => {
  test("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/api/unknown-route-xyz");

    expect(response.status).toBe(404);
  });

  test("returns 404 for an unknown non-api route", async () => {
    const response = await request(app).get("/not-a-real-path");

    expect(response.status).toBe(404);
  });
});
