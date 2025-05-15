import { Request, Response } from 'express'

export const FetchMe = async (req: Request, res: Response<APIResponse>) => {
    res.json({
        message: "User Fetched",
        data: {
            userData: req.user
        }
    })

}