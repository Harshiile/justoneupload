import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const Res = NextResponse.json({})
    Res.cookies.delete('acsTkn')
    Res.cookies.delete('auth')
    return Res
}

