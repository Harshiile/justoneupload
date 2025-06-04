import { JOUError } from '@/lib/error';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JwtValidate } from './app/api/lib/jwt';

export async function middleware(req: NextRequest) {
    const accessToken = req.cookies.get('acsTkn')?.value
    const errMsg = "Please Login Again"
    const EXPIRED_CODE = Number(process.env.EXPIRED_CODE)

    if (!accessToken) {
        console.log('Access Token Undefined');
        return JOUError(EXPIRED_CODE, "Seesion Expired")
    }
    else {
        try {
            const { payload: userData } = await JwtValidate(accessToken)
            // User Validated
            if (typeof (userData) == 'string') return JOUError(401, errMsg);
            const user = {
                id: userData.id,
                name: userData.name,
                userType: userData.userType
            }
            const Res = NextResponse.next()
            Res.headers.set('x-user', JSON.stringify(user))
            return Res;
        } catch (err) {
            if (err instanceof Error) {
                if (err.message == 'JWTExpired') {
                    // Access Token Expires
                    console.log('Access Token Expires');
                    return JOUError(EXPIRED_CODE, "Seesion Expired")
                }
                else {
                    // Token Corrupted
                    console.log('Access Token Corrupted');
                    return JOUError(401, errMsg)
                }
            }
        }
    }
}

export const config = {
    matcher: ['/api/drive/:path*', '/api/youtube/:path*', '/api/fetch/:path*', '/api/update/:path*'],
}










