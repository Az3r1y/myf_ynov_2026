import { Request } from "express";
import jwt from "jsonwebtoken";
import { getUserFromRequest } from "../src/utils/getUserFromRequest";
import { User } from "../src/entities/User";

jest.mock("../src/entities/User");

const tokenSecretKey = "superlongstring";

describe("getUserFromRequest", () => {
  test("returns null when no Authorization header and no cookie", async () => {
    const req = { headers: {}, cookies: {} } as unknown as Request;

    const result = await getUserFromRequest(req);

    expect(result).toBeNull();
  });

  test("returns null when Authorization header has an invalid token", async () => {
    const req = {
      headers: { authorization: "Bearer invalid.token.here" },
      cookies: {},
    } as unknown as Request;

    const result = await getUserFromRequest(req);

    expect(result).toBeNull();
  });

  test("returns a falsy value when token payload has no userId", async () => {
    const token = jwt.sign({ foo: "bar" }, tokenSecretKey);
    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    } as unknown as Request;

    const result = await getUserFromRequest(req);

    expect(result).toBeFalsy();
  });

  test("returns null when token is valid but user does not exist in db", async () => {
    const token = jwt.sign({ userId: 9999 }, tokenSecretKey);
    (User.findOneBy as jest.Mock).mockResolvedValue(null);

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    } as unknown as Request;

    const result = await getUserFromRequest(req);

    expect(result).toBeNull();
  });

  test("returns the user when a valid Bearer token matches a db user", async () => {
    const fakeUser = { id: 1, email: "user@example.com" };
    const token = jwt.sign({ userId: 1 }, tokenSecretKey);
    (User.findOneBy as jest.Mock).mockResolvedValue(fakeUser);

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    } as unknown as Request;

    const result = await getUserFromRequest(req);

    expect(result).toEqual(fakeUser);
  });

  test("reads the token from a cookie when no Authorization header is present", async () => {
    const fakeUser = { id: 2, email: "cookie@example.com" };
    const token = jwt.sign({ userId: 2 }, tokenSecretKey);
    (User.findOneBy as jest.Mock).mockResolvedValue(fakeUser);

    const req = {
      headers: {},
      cookies: { token },
    } as unknown as Request;

    const result = await getUserFromRequest(req);

    expect(result).toEqual(fakeUser);
  });
});
