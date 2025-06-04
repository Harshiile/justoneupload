// export async function GET(req: Request) {
//     return Response.json({
//         x: "Hello"
//     })
// }

// // import { db } from '../../db'
// // import { UserTable } from '../../db/schema'
// // import { eq } from 'drizzle-orm'
// // import { JwtGenerate } from '../../lib/jwt'
// // import { User } from '../../types/User'
// // import { comparePass, encryptPass } from '../../lib/func/hashing'
// // import { JOUError } from '../../lib/error'
// // import { v4 } from 'uuid'

// interface UserData {
//     id: string
//     name: string
//     userType: 'youtuber' | 'editor'
// }

// // Checks whether user already exist
// export async function POST (email: string) => {
//     return db.select({
//         id: UserTable.id,
//         name: UserTable.name,
//         userType: UserTable.userType,
//         password: UserTable.password
//     })
//         .from(UserTable)
//         .where(eq(UserTable.email, email))
//         .then(([user]) => user)
//         .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1001`) })
// }

// // Generates Tokens
// export const generateTokens = (userData: UserData) => {
//     const accessToken = JwtGenerate(userData, process.env.ACCESS_TOKEN_EXPIRY!)
//     const refreshToken = JwtGenerate({ id: userData.id }, process.env.REFRESH_TOKEN_EXPIRY!)
//     return { accessToken, refreshToken }
// }

// export const cookieOptions = {
//     httpOnly: true,
//     secure: true,
//     sameSite: true,
//     maxAge: 3 * 24 * 60 * 60 * 1000
// }






