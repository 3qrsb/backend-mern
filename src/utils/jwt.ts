import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config";

interface TokenPayload {
  id: string;
  type: "access" | "refresh";
}

const baseOptions: SignOptions = {
  issuer: config.JWT_ISSUER,
  audience: config.JWT_AUDIENCE,
  algorithm: "HS256",
};

export function generateTokenPair(userId: string) {
  const accessToken = jwt.sign(
    { id: userId, type: "access" } as TokenPayload,
    config.JWT_SECRET,
    { ...baseOptions, expiresIn: config.JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: "refresh" } as TokenPayload,
    config.JWT_SECRET,
    { ...baseOptions, expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}
