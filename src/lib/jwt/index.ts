import { sign, SignOptions, verify } from 'jsonwebtoken'

export const JwtValidate = (token: string) => {
    try {
        return verify(token, process.env.JWT_SECRET!)
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