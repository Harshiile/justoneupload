import { Request, Response, NextFunction } from 'express'
import { JwtGenerate, JwtValidate } from '../lib/jwt'
import { renewAccessToken } from '../controllers/auth'

export const authorize = async (req: Request, res: Response<APIResponse>, next: NextFunction) => {
    const accessToken = req.headers['authorization']!.split('Bearer ')[1]
    if (!accessToken) {
        // log out - frontend always send accessToken - react state not expires the access token
        res.json({
            message: "Middlware - Logout",
        })
    }
    else {
        try {
            const userData = JwtValidate(accessToken)
            console.log('Passed - next()');
            next()
        } catch (err) {
            if (err instanceof Error) {
                if (err.message == 'TokenExpiredError') {
                    // Access Token Expires - Renew It
                    const refreshToken = req.cookies['auth']
                    if (refreshToken) {
                        try {
                            const refTkn = JwtValidate(refreshToken);
                            // RenewToken(userId)
                            const newAccessToken = typeof (refTkn) != 'string' ? await renewAccessToken(refTkn.id) : null
                            res.json({
                                message: "Middlware - Renew Access Token",
                                data: {
                                    accessToken: newAccessToken
                                }
                            })
                        } catch (error) {
                            res.json({
                                message: "Middlware - LogOut - Ref Token Expires or Corrupted",
                            })
                        }
                    }
                    else {
                        res.json({
                            message: "Middlware - LogOut - Ref Token Expires or Corrupted",
                        })
                    }
                }
                else {
                    // Logout - Corrupt Access Token
                    res.json({
                        message: "Middlware - Logout",
                    })
                }
            }
        }
    }

}