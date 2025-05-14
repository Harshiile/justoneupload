import { Request, Response } from 'express'
import { db } from '../../db'
import { UserTable } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { JwtGenerate } from '../../lib/jwt'
import { User } from '../../types/User'
import { comparePass, encryptPass } from '../../lib/func/hashing'
import { JOUError } from '../../lib/error'
import { v4 } from 'uuid'

interface UserData {
    id: string
    name: string
    userType: 'youtuber' | 'editor'
}

const userExist = async (email: string) => {
    return db.select({
        id: UserTable.id,
        name: UserTable.name,
        userType: UserTable.userType,
        password: UserTable.password
    })
        .from(UserTable)
        .where(eq(UserTable.email, email))
        .then(([user]) => user)
        .catch(err => { throw new JOUError(err.status, err.message) })
}

export const generateTokens = (userData: UserData) => {
    const accessToken = JwtGenerate(userData, process.env.ACCESS_TOKEN_EXPIRY!)
    const refreshToken = JwtGenerate({ id: userData.id }, process.env.REFRESH_TOKEN_EXPIRY!)
    return { accessToken, refreshToken }
}

export const signUser = async (req: Request<{}, {}, User>, res: Response<APIResponse>) => {
    const { email, password, userType, name } = req.body

    const user = await userExist(email)

    if (!user) {
        const hashPassword = await encryptPass(password)
        const id = v4()
        const userData = {
            id,
            name,
            userType
        }
        const { refreshToken, accessToken } = generateTokens(userData)
        await db.insert(UserTable).values({
            id,
            name,
            email,
            password: hashPassword,
            userType,
            refreshToken
        }).catch(err => { throw new JOUError(err.status, err.message) })

        res
            .status(200)
            .cookie('auth', refreshToken, {
                httpOnly: true,
                secure: true,
            })
            .json({
                message: "User Signed In",
                data: {
                    userData,
                    accessToken
                }
            })
    }
    else throw new JOUError(409, "User Already Exist")
}



export const loginUser = async (req: Request<{}, {}, User>, res: Response<APIResponse>) => {
    const { email, password } = req.body

    const user = await userExist(email)
    if (user) {
        if (await comparePass(user.password!, password)) {
            const userData = {
                id: user.id,
                name: user.name!,
                userType: user.userType,
            }
            const { refreshToken, accessToken } = generateTokens(userData)
            // Store refreshToken in DB
            // await db.update(UserTable).set({
            //     refreshToken
            // }).where(eq(UserTable.id, userData.id)).catch(err => { throw new JOUError(400, "Please Login Again") })

            res
                .status(200)
                .cookie('auth', refreshToken, {
                    httpOnly: true,
                    secure: true
                })
                .json({
                    message: "User Logged In",
                    data: {
                        userData,
                        accessToken
                    }
                })
        }
        else throw new JOUError(401, "Incorrect Password")
    }
    else throw new JOUError(404, "User not Found")
}


export const logoutUser = async (req: Request, res: Response<APIResponse>) => {
    res.clearCookie('auth');
    res.json({
        message: "User Logged Out",
        data: {
            accessToken: null
        }
    })
}
