import { Request, Response } from 'express'
import { JOUError } from '../../lib/error'
import { JwtValidate } from '../../lib/jwt';

export const decryptLink = (req: Request, res: Response<APIResponse>) => {
    const link = req.params.link
    if (!link) throw new JOUError(404, "Link not found");

    try {
        res.json({
            message: "Decryption of Link",
            data: {
                decryptedData: JwtValidate(link)
            }
        });
    } catch (err) {
        if (err instanceof Error) {
            if (err.name == 'TokenExpiredError') throw new JOUError(401, "Link is expires")
        }
        else throw new JOUError(400, "Link is not valid")
    }
}   