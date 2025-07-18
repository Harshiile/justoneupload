import JWT from "jsonwebtoken";
import { JWTPayload, jwtVerify } from "jose";

export const JwtValidate = async <T>(token: string): Promise<T> => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const resData = (await jwtVerify(token, secret)).payload;
    return resData as T;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.name);
    }
    throw new Error("Unknown Error During Token Validation");
  }
};

export const JwtGenerate = (payload: object, expiry?: string) => {
  return expiry
    ? JWT.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: expiry,
      } as JWT.SignOptions)
    : JWT.sign(payload, process.env.JWT_SECRET!);
};
