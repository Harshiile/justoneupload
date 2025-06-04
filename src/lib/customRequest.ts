import { NextRequest } from "next/server"

interface User {
    id: string
    name: string
    userType: 'youtuber' | 'editor'
}
export interface CustomNextRequest extends NextRequest {
    user: User
}