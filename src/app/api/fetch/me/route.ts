import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../utils/getUser";

export async function GET(req: NextRequest) {
    return NextResponse.json({ user: getUser(req) })
}