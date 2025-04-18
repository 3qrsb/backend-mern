import { auth, admin, adminOrSeller } from "../middleware/auth";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { Request, Response, NextFunction } from "express";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel", () => ({
  findById: jest.fn(),
}));

describe("auth middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.resetAllMocks();
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it("should 401 and call next(error) if no Authorization header", async () => {
    await auth(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should 401 and call next(error) on invalid token", async () => {
    req.headers!.authorization = "Bearer bad.token";
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("fail");
    });
    await auth(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should attach user and call next() on valid access token", async () => {
    const fakeUser = { _id: "123", isAdmin: false };
    (jwt.verify as jest.Mock).mockReturnValue({ id: "123", type: "access" });
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });
    req.headers!.authorization = "Bearer good.token";

    await auth(req as Request, res as Response, next);

    expect((req as any).user).toBe(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });

  it("should 401 and call next(error) if token.type !== 'access'", async () => {
    req.headers!.authorization = "Bearer some.token";
    (jwt.verify as jest.Mock).mockReturnValue({ id: "123", type: "refresh" });
    await auth(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should 401 and call next(error) if no user in DB", async () => {
    req.headers!.authorization = "Bearer some.token";
    (jwt.verify as jest.Mock).mockReturnValue({ id: "123", type: "access" });
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    await auth(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("admin middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it("should 401 and call next(error) if user is not admin", async () => {
    (req as any).user = { isAdmin: false };
    await admin(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should call next() if user is admin", async () => {
    (req as any).user = { isAdmin: true };
    await admin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("adminOrSeller middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it("should 401 and call next(error) if user is neither admin nor seller", async () => {
    (req as any).user = { isAdmin: false, isSeller: false };
    await adminOrSeller(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should call next() if user is admin", async () => {
    (req as any).user = { isAdmin: true, isSeller: false };
    await adminOrSeller(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("should call next() if user is seller", async () => {
    (req as any).user = { isAdmin: false, isSeller: true };
    await adminOrSeller(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith();
  });
});
