import { JwtGenerate } from "@/app/api/lib/jwt"
import { User } from "../login/route"

export const generateTokens = (userData: User) => {
    const accessToken = JwtGenerate(userData, process.env.ACCESS_TOKEN_EXPIRY!)
    const refreshToken = JwtGenerate({ id: userData.id }, process.env.REFRESH_TOKEN_EXPIRY!)
    return { accessToken, refreshToken }
}