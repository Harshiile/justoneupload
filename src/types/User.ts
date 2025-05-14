export interface User {
    name: string,
    email: string,
    userType: 'youtuber' | 'editor',
    password: string,
    refreshToken?: string
}