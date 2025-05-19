import { eq } from "drizzle-orm"
import { db } from "../../db"
import { UserTable } from "../../db/schema"
import { JwtGenerate, JwtValidate } from "../../lib/jwt"
import { JOUError } from "../../lib/error"
import { Request, Response } from 'express'
import { cookieOptions } from "./auth"


export const renewAccessToken = async (req: Request, res: Response<APIResponse>) => {
    const refreshToken = req.cookies['auth']
    if (!refreshToken) throw new JOUError(403, "Please Login Again");

    try {
        const refTkn = JwtValidate(refreshToken);
        if (typeof (refTkn) == 'string') throw new JOUError(403, "Please Login Again")

        const [user] = await db.select({
            id: UserTable.id,
            name: UserTable.name,
            userType: UserTable.userType,
        }).from(UserTable).where(eq(UserTable.id, refTkn.id)).catch(err => { throw new JOUError(403, "Please Login Again") })

        if (!user) throw new JOUError(404, "User Not Found")

        const userData = {
            id: user.id,
            name: user.name,
            userType: user.userType
        }
        res
            .status(200)
            .cookie('acsTkn', JwtGenerate(userData, process.env.ACCESS_TOKEN_EXPIRY!), cookieOptions)
            .json({ message: "Token Renewed" })
    } catch (error) {
        throw new JOUError(403, "Unthorized User - Log Out")
    }
}