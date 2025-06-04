import { userExist } from '../utils/userExist'
import { NextResponse } from 'next/server'
import { generateTokens } from '../utils/token'
import { cookieOptions } from '../utils/cookieOptions'
import { comparePass } from '../utils/cryptography'
import { JOUError } from '@/lib/error'

export async function POST(req: Request) {
    const { email, password } = await req.json()

    try {
        const user = await userExist(email)
        if (user) {
            if (await comparePass(user.password, password)) {
                const userData = {
                    id: user.id,
                    name: user.name!,
                    userType: user.userType,
                }
                const { refreshToken, accessToken } = generateTokens(userData);

                const Res = NextResponse.json({ message: "User Logged In", user: userData })
                Res.cookies.set('auth', refreshToken, cookieOptions)
                Res.cookies.set('acsTkn', accessToken, cookieOptions)

                return Res
            }
            return JOUError(401, "Incorrect Password")
        }
        return JOUError(404, "User not Found")
    }
    catch (_) { JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1001`) }
}