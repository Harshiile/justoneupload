import { Request, Response, NextFunction } from 'express'
import { JOUError } from '../lib/error'
import { JwtValidate } from '../lib/jwt';


export const authorize = (req: Request, res: Response<APIResponse>, next: NextFunction) => {
    const accessToken = req.cookies['acsTkn']
    const errMsg = "Please Login Again"

    if (!accessToken) {
        console.log('Access Token Undefined');
        throw new JOUError(401, errMsg)
    }
    else {
        try {
            const userData = JwtValidate(accessToken)
            // User Validated
            if (typeof (userData) == 'string') throw new JOUError(401, errMsg);
            req.user = {
                id: userData.id,
                name: userData.name,
                userType: userData.userType
            }
            next()
        } catch (err) {
            if (err instanceof Error) {
                if (err.message == 'TokenExpiredError') {
                    // Access Token Expires
                    console.log('Access Token Expires');
                    throw new JOUError(999, "Seesion Expired")
                }
                else {
                    // Token Corrupted
                    console.log('Access Token Corrupted');
                    throw new JOUError(401, errMsg)
                }
            }
        }
    }
}
