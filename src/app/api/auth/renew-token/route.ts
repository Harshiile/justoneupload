import { db } from "@/db";
import { UserTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { eq } from 'drizzle-orm'
import { cookieOptions } from "../utils/cookieOptions";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JwtGenerate, JwtValidate } from "../../lib/jwt";

export async function GET(req: NextRequest) {
    const refreshToken = req.cookies.get('auth')?.value?.toString()

    if (!refreshToken) return JOUError(403, "Please Login Again");

    try {
        const { payload: refTkn } = await JwtValidate(refreshToken);

        try {
            if (!refTkn.id) throw new Error();
            const [user] = await db
                .select({
                    id: UserTable.id,
                    name: UserTable.name,
                    userType: UserTable.userType,
                })
                .from(UserTable)
                .where(eq(UserTable.id, refTkn.id?.toString()!))

            if (!user) return JOUError(404, "User Not Found")

            const userData = {
                id: user.id,
                name: user.name,
                userType: user.userType
            }
            const Res = NextResponse.json({})
            Res.cookies.set('acsTkn', JwtGenerate(userData, process.env.ACCESS_TOKEN_EXPIRY!), cookieOptions)
            return Res
        } catch (error) { JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1003`) }
    } catch (error) { return JOUError(403, "Unauthorized User - Log Out") }
}