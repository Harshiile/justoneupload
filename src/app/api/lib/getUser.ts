import { NextRequest } from "next/server";

interface User {
    id: string,
    name: string
    userType: 'youtuber' | 'editor'
}
export const getUser = (req: NextRequest): User => {
    const user = JSON.parse(req.headers.get('x-user') || '{}');
    return user
}