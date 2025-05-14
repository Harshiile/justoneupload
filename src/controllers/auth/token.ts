import { eq } from "drizzle-orm"
import { db } from "../../db"
import { UserTable } from "../../db/schema"
import { JwtGenerate } from "../../lib/jwt"
import { JOUError } from "../../lib/error"

const rotateRefreshToken = () => {

}

export const renewAccessToken = async (userId: string) => {
    const [user] = await db.select({
        name: UserTable.name,
        userType: UserTable.userType,
    }).from(UserTable).where(eq(UserTable.id, userId)).catch(err => { throw new JOUError(400, "Please Login Again") })

    if (!user) return null
    const userData = {
        id: userId,
        name: user.name,
        userType: user.userType

    }
    return JwtGenerate(userData, process.env.ACCESS_TOKEN_EXPIRY!)
}