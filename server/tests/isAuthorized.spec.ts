import { Request, Response, NextFunction } from "express";
import { isAuthorized } from "../src/utils/isAuthorized";
import * as getUserFromRequestModule from "../src/utils/getUserFromRequest";

describe("isAuthorized middleware", () => {
  const mockReq = {} as Request;
  const mockNext = jest.fn() as NextFunction;

  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("calls next() when a valid user is found", async () => {
    jest
      .spyOn(getUserFromRequestModule, "getUserFromRequest")
      .mockResolvedValue({ id: 1, email: "user@example.com" } as any);

    await isAuthorized(mockReq, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test("returns 403 with access denied message when no user is found", async () => {
    jest
      .spyOn(getUserFromRequestModule, "getUserFromRequest")
      .mockResolvedValue(null);

    await isAuthorized(mockReq, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "access denied" });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
