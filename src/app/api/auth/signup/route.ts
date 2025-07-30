import { db } from "@/db";
import { encryptPass } from "../utils/cryptography";
import { userExist } from "../utils/userExist";
import { v4 } from "uuid";
import { UserTable } from "@/db/schema";
import { generateTokens } from "../utils/token";
import { JOUError } from "@/lib/error";
import { NextResponse } from "next/server";
import { cookieOptions } from "../utils/cookieOptions";

export async function POST(req: Request) {
  const { email, password, userType, name } = await req.json();

  const user = await userExist(email);

  if (!user) {
    const hashPassword = await encryptPass(password);
    const id = v4();
    const userData = {
      id,
      name,
      userType,
    };
    const { refreshToken, accessToken } = generateTokens(userData);

    console.log({
      id,
      name,
      email,
      password: hashPassword,
      userType,
    });

    await db
      .insert(UserTable)
      .values({
        id,
        name,
        email,
        password: hashPassword,
        userType,
      })
      .catch((_) =>
        JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1002`)
      );

    const Res = NextResponse.json({
      message: "User Logged In",
      user: userData,
    });
    Res.cookies.set("auth", refreshToken, cookieOptions);
    Res.cookies.set("acsTkn", accessToken, cookieOptions);
    return Res;
  }
  return JOUError(409, "User Already Exist");
}
