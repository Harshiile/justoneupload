import { Request, Response } from 'express'

// Fetching User on Refresh
export const fetchUserOnRefresh = async (req: Request, res: Response<APIResponse>) => {
    res.json({
        message: "User Fetched",
        data: {
            userData: req.user
        }
    })

}