import { Request, Response } from 'express'

// Fetching User on Refresh
export const fetchMe = async (req: Request, res: Response<APIResponse>) => {
    res.json({
        message: "User Fetched",
        data: {
            userData: req.user
        }
    })

}