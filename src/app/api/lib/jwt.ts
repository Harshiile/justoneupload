import { sign, SignOptions, verify } from 'jsonwebtoken'
import { jwtVerify } from 'jose'

export const JwtValidate = async (token: string) => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        return await jwtVerify(token, secret)
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.name);
        }
        throw new Error('Unknown Error During Token Validation')
    }
}

export const JwtGenerate = (payload: object, expiry?: string) => {
    return expiry ? sign(payload, process.env.JWT_SECRET!, { expiresIn: expiry } as SignOptions) : sign(payload, process.env.JWT_SECRET!)
}